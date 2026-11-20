/**
 * Frontend client for the MediSpace API (see the api/ folder).
 * Handles auth headers, streaming chat responses, and error normalisation.
 */
import { supabase } from '@/lib/supabase'

// The API lives in this repo's api/ folder and is served from the same domain
const BACKEND_URL = ''

async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatResult {
  conversationId: string | null
  usageToday: number
  usageLeft: number
  usageLimit: number
}

/**
 * Sends a message to the AI and streams the response via SSE.
 * onChunk is called with each text delta as it arrives.
 * Resolves with usage stats once the stream finishes.
 * Throws with a user-facing error message on failure.
 */
export async function sendChatMessage(params: {
  message: string
  conversationId?: string | null
  topic?: string | null
  onChunk: (chunk: string) => void
  /** Called as soon as the reply is complete, before the stream closes */
  onDone?: (result: ChatResult) => void
}): Promise<ChatResult> {
  const headers = await authHeaders({ Accept: 'text/event-stream' })

  let response: Response
  try {
    response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: params.message,
      conversationId: params.conversationId ?? undefined,
      topic: params.topic ?? undefined,
    }),
  })
  } catch {
    // fetch only rejects when the server can't be reached at all
    throw new Error("Can't reach the MediSpace server right now. Check your connection and try again.")
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const detail = body.code ? ` (${body.code})` : !body.error ? ` (error ${response.status})` : ''
    throw Object.assign(new Error((body.error ?? 'Chat request failed') + detail), {
      status: response.status,
      usageLeft: body.usageLeft ?? 0,
    })
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result: ChatResult = { conversationId: null, usageToday: 0, usageLeft: 0, usageLimit: 20 }
  let gotDone = false

  while (true) {
    let chunk: ReadableStreamReadResult<Uint8Array>
    try {
      chunk = await reader.read()
    } catch (err) {
      // The reply is already saved once "done" arrived; only the title was left
      if (gotDone) break
      throw err
    }
    const { done, value } = chunk
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') continue

      let event
      try {
        event = JSON.parse(raw)
      } catch {
        continue // skip unparseable lines
      }
      {
        if (event.type === 'delta') {
          params.onChunk(event.content as string)
        } else if (event.type === 'done') {
          result = {
            conversationId: event.conversationId ?? null,
            usageToday: event.usageToday ?? 0,
            usageLeft: event.usageLeft ?? 0,
            usageLimit: event.usageLimit ?? 20,
          }
          gotDone = true
          params.onDone?.(result)
        } else if (event.type === 'error') {
          throw new Error(event.message ?? 'Stream error')
        }
      }
    }
  }

  return result
}

export interface Usage {
  usageToday: number
  usageLimit: number
  usageLeft: number
}

/** Today's message allowance for whoever is calling (signed in or not). */
export async function getUsage(): Promise<Usage | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/usage`, { headers: await authHeaders() })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface Plan {
  id: 'free' | 'premium'
  name: string
  price: number
  currency: string
  interval: string
  messagesPerDay: number
  features: string[]
  unavailable: string[]
}

export async function getPlans(): Promise<Plan[]> {
  const res = await fetch(`${BACKEND_URL}/api/billing/plans`)
  if (!res.ok) throw new Error('Failed to fetch plans')
  const data = await res.json()
  return data.plans
}

/** Starts a Paystack checkout for a Premium pass; resolves to the payment page URL. */
export async function startCheckout(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/api/billing/checkout`, { method: 'POST', headers: await authHeaders() })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.url) throw new Error(body.error ?? 'Could not start the payment.')
  return body.url
}

export type PaymentCheck =
  | { status: 'credited'; premiumUntil: string }
  | { status: 'pending' | 'failed' | 'mismatch' | 'error'; message: string }

/** Confirms a payment after the user returns from Paystack. */
export async function verifyPayment(reference: string): Promise<PaymentCheck> {
  const res = await fetch(`${BACKEND_URL}/api/billing/verify?reference=${encodeURIComponent(reference)}`, {
    headers: await authHeaders(),
  })
  const body = await res.json().catch(() => ({}))
  if (body.status) return body
  return { status: 'error', message: body.error ?? 'Could not check the payment.' }
}
