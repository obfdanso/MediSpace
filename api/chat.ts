/**
 * POST /api/chat
 * Streams a reply from a free Groq-hosted model as server-sent events:
 *   data: {"type":"delta","content":"..."}
 *   data: {"type":"done","conversationId":"...","usageToday":N,"usageLimit":N,"usageLeft":N}
 *   data: [DONE]
 * Signed-in users get their conversation saved; everyone gets a daily limit.
 */
import { db, env, json, getCaller, getLimit, getTodayUsage, incrementUsage } from './_lib/server'
import { buildSystemPrompt, type HealthProfile } from './_lib/prompt'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MAX_MESSAGE_LENGTH = 4000
const HISTORY_LIMIT = 20

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export async function POST(req: Request): Promise<Response> {
  const apiKey = env('GROQ_API_KEY')
  if (!apiKey) return json({ error: 'The AI service is not set up yet.' }, 503)

  let body: { message?: unknown; conversationId?: unknown; topic?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return json({ error: 'Please type a message.' }, 400)
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.` }, 400)
  }
  const topic = typeof body.topic === 'string' ? body.topic.slice(0, 100) : null
  const requestedConversation = typeof body.conversationId === 'string' ? body.conversationId : null

  // ── Who is asking, and do they have messages left today ───────────────────
  const caller = await getCaller(req)
  const limit = getLimit(caller.tier)
  const usageToday = await getTodayUsage(caller)

  if (usageToday >= limit) {
    return json({
      error: caller.tier === 'anonymous'
        ? 'Free message limit reached. Sign in to keep chatting.'
        : 'You have reached today\'s message limit. It resets at midnight UTC.',
      usageToday,
      usageLimit: limit,
      usageLeft: 0,
    }, 429)
  }

  // ── Conversation history and health profile (signed-in users only) ────────
  let conversationId: string | null = null
  let history: ChatMessage[] = []
  let healthProfile: HealthProfile | null = null

  if (db && caller.userId) {
    if (requestedConversation) {
      const { data: conv } = await db
        .from('conversations').select('id, user_id').eq('id', requestedConversation).maybeSingle()
      if (!conv || conv.user_id !== caller.userId) {
        return json({ error: 'Conversation not found.' }, 403)
      }
      conversationId = conv.id

      const { data: msgs } = await db
        .from('messages').select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT)
      history = (msgs ?? []).reverse() as ChatMessage[]
    }

    const { data: hp } = await db
      .from('health_profiles').select('*').eq('user_id', caller.userId).maybeSingle()
    healthProfile = hp as HealthProfile | null
  }

  // ── Ask the model ─────────────────────────────────────────────────────────
  let upstream: Response
  try {
    upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env('GROQ_MODEL') ?? 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: buildSystemPrompt(topic, healthProfile) },
          ...history,
          { role: 'user', content: message },
        ],
        stream: true,
        temperature: 0.4,
        max_completion_tokens: 1500,
      }),
    })
  } catch {
    return json({ error: 'The AI service could not be reached. Please try again.' }, 502)
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    console.error('[chat] groq error', upstream.status, detail.slice(0, 500))
    return upstream.status === 429
      ? json({ error: 'The AI is busy right now. Please try again in a minute.' }, 503)
      : json({ error: 'The AI service is unavailable right now. Please try again.' }, 502)
  }

  // The model accepted the request: now it counts and gets saved
  if (db && caller.userId && !conversationId) {
    const title = (topic ? `${topic}: ` : '') + (message.length > 60 ? `${message.slice(0, 57)}...` : message)
    const { data: conv } = await db
      .from('conversations').insert({ user_id: caller.userId, title, topic }).select('id').single()
    conversationId = conv?.id ?? null
  }

  await Promise.all([
    incrementUsage(caller),
    db && conversationId
      ? db.from('messages').insert({ conversation_id: conversationId, role: 'user', content: message })
      : null,
  ])

  const newUsage = usageToday + 1
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = upstream.body.getReader()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      let reply = ''
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') continue
            try {
              const chunk = JSON.parse(raw)?.choices?.[0]?.delta?.content
              if (chunk) {
                reply += chunk
                send({ type: 'delta', content: chunk })
              }
            } catch { /* ignore partial lines */ }
          }
        }

        if (db && conversationId && reply) {
          await Promise.all([
            db.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: reply }),
            db.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId),
          ])
        }

        send({
          type: 'done',
          conversationId,
          usageToday: newUsage,
          usageLimit: limit,
          usageLeft: Math.max(0, limit - newUsage),
        })
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        console.error('[chat] stream error', err)
        send({ type: 'error', message: 'The reply was interrupted. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
