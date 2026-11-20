/**
 * POST /api/chat
 * Streams a reply from a free Groq-hosted model as server-sent events:
 *   data: {"type":"delta","content":"..."}
 *   data: {"type":"done","conversationId":"...","usageToday":N,"usageLimit":N,"usageLeft":N}
 *   data: [DONE]
 * Signed-in users get their conversation saved; everyone gets a daily limit.
 */
import { db, env, json, getCaller, getLimit, reserveMessage, refundMessage } from './_lib/server'
import { buildSystemPrompt, type HealthProfile } from './_lib/prompt'
import { writeTitle } from './_lib/title'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MAX_MESSAGE_LENGTH = 4000
const HISTORY_LIMIT = 20
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'
// Preferred general chat models, best first, used if the configured one is gone
// Remembered for the life of this server instance once a fallback is found
let fallbackModel: string | null = null
const MODEL_PREFERENCES = [/llama-?4.*maverick/i, /llama.*70b/i, /gpt-oss-120b/i, /llama-?4/i, /qwen/i, /gpt-oss/i, /llama/i]

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
  // Claimed up front so parallel requests can't slip past the limit;
  // handed back below if the AI call fails
  let newUsage: number | null
  try {
    newUsage = await reserveMessage(caller, limit)
  } catch (err) {
    console.error('[chat] usage error', err)
    return json({ error: 'Something went wrong. Please try again.' }, 500)
  }

  if (newUsage === null) {
    return json({
      error: caller.tier === 'anonymous'
        ? 'Free message limit reached. Sign in to keep chatting.'
        : 'You have reached today\'s message limit. It resets at midnight UTC.',
      usageToday: limit,
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
        await refundMessage(caller)
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
  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(topic, healthProfile) },
    ...history,
    { role: 'user', content: message },
  ]

  let upstream: Response
  try {
    upstream = await askGroq(apiKey, fallbackModel ?? env('GROQ_MODEL') ?? DEFAULT_MODEL, messages)

    // The model may have been retired: pick one Groq still offers and retry once
    if (!upstream.ok && (upstream.status === 400 || upstream.status === 404)) {
      const detail = await upstream.clone().text().catch(() => '')
      let code = ''
      try { code = JSON.parse(detail)?.error?.code ?? '' } catch { /* not json */ }
      if (/model_(decommissioned|not_found)/.test(code) || /model.*(decommissioned|does not exist|not found)/i.test(detail)) {
        const fallback = await pickAvailableModel(apiKey)
        if (fallback) {
          console.warn(`[chat] model unavailable, using ${fallback}. Set GROQ_MODEL to skip this lookup.`)
          fallbackModel = fallback
          upstream = await askGroq(apiKey, fallback, messages)
        }
      }
    }
  } catch {
    await refundMessage(caller)
    return json({ error: 'The AI service could not be reached. Please try again.' }, 502)
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    console.error('[chat] groq error', upstream.status, detail.slice(0, 500))
    await refundMessage(caller)
    // Groq's error code (never the key) helps tell a bad key from a retired model
    let code = ''
    try { code = JSON.parse(detail)?.error?.code ?? '' } catch { /* not json */ }
    const ref = `groq ${upstream.status}${code ? ` ${code}` : ''}`
    if (upstream.status === 429) {
      return json({ error: 'The AI is busy right now. Please try again in a minute.', code: ref }, 503)
    }
    if (upstream.status === 401 || upstream.status === 403) {
      return json({ error: "The AI service rejected the site's API key.", code: ref }, 502)
    }
    return json({ error: 'The AI service is unavailable right now. Please try again.', code: ref }, 502)
  }

  // The model accepted the request: now it counts and gets saved
  const isNewConversation = !!(db && caller.userId && !conversationId)
  if (db && caller.userId && !conversationId) {
    // Placeholder until the AI-written title replaces it after the reply
    const title = message.length > 60 ? `${message.slice(0, 57)}...` : message
    const { data: conv } = await db
      .from('conversations').insert({ user_id: caller.userId, title, topic }).select('id').single()
    conversationId = conv?.id ?? null
  }

  let userMessageId: string | null = null
  if (db && conversationId) {
    const { data: saved } = await db
      .from('messages').insert({ conversation_id: conversationId, role: 'user', content: message }).select('id').single()
    userMessageId = saved?.id ?? null
  }

  const usedToday = newUsage
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = upstream.body.getReader()

  // If the visitor leaves mid-reply we keep reading, so the full answer is
  // still saved to their chat; we just stop sending to the closed connection
  let clientGone = false

  const stream = new ReadableStream({
    async start(controller) {
      const write = (text: string) => {
        if (clientGone) return
        try { controller.enqueue(encoder.encode(text)) } catch { clientGone = true }
      }
      const send = (data: unknown) => write(`data: ${JSON.stringify(data)}\n\n`)
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
            let chunk: string | undefined
            try { chunk = JSON.parse(raw)?.choices?.[0]?.delta?.content } catch { /* ignore partial lines */ }
            if (chunk) {
              reply += chunk
              send({ type: 'delta', content: chunk })
            }
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
          usageToday: usedToday,
          usageLimit: limit,
          usageLeft: Math.max(0, limit - usedToday),
        })

        // A new chat gets a short AI-written title. It's written after "done"
        // so the reply unlocks at once; the stream stays open until it's saved
        // so the sidebar shows it when it refreshes at the end
        if (db && conversationId && reply && isNewConversation) {
          try {
            const title = await writeTitle(apiKey, message, reply, fallbackModel ?? env('GROQ_MODEL') ?? DEFAULT_MODEL)
            if (title) await db.from('conversations').update({ title }).eq('id', conversationId)
          } catch (err) {
            console.error('[chat] title failed', err)
          }
        }
        write('data: [DONE]\n\n')
      } catch (err) {
        console.error('[chat] stream error', err)
        // Nothing usable came back: give the message back and drop the
        // unanswered question so the chat history stays in pairs
        await refundMessage(caller).catch(() => {})
        if (db && userMessageId) await db.from('messages').delete().eq('id', userMessageId)
        send({ type: 'error', message: 'The reply was interrupted. Please try again.' })
      } finally {
        if (!clientGone) {
          try { controller.close() } catch { /* already closed */ }
        }
      }
    },
    cancel() {
      clientGone = true
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

function askGroq(apiKey: string, model: string, messages: ChatMessage[]) {
  return fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true, temperature: 0.4, max_completion_tokens: 1500 }),
  })
}

async function pickAvailableModel(apiKey: string): Promise<string | null> {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  }).catch(() => null)
  if (!res?.ok) return null
  const { data } = await res.json() as { data?: { id: string; active?: boolean }[] }
  const ids = (data ?? [])
    .filter(m => m.active !== false && !/whisper|tts|guard|embed|vision|compound/i.test(m.id))
    .map(m => m.id)
  for (const pattern of MODEL_PREFERENCES) {
    const hit = ids.find(id => pattern.test(id))
    if (hit) return hit
  }
  return ids[0] ?? null
}

