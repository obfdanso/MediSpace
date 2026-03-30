/**
 * Frontend client for the MediSpace backend API.
 * Handles auth headers, streaming chat responses, and error normalisation.
 */
import { supabase } from '@/lib/supabase'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'

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
}): Promise<ChatResult> {
  const headers = await authHeaders({ Accept: 'text/event-stream' })

  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: params.message,
      conversationId: params.conversationId ?? undefined,
      topic: params.topic ?? undefined,
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw Object.assign(new Error(body.error ?? 'Chat request failed'), {
      status: response.status,
      usageLeft: body.usageLeft ?? 0,
    })
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result: ChatResult = { conversationId: null, usageToday: 0, usageLeft: 0, usageLimit: 20 }

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
        const event = JSON.parse(raw)
        if (event.type === 'delta') {
          params.onChunk(event.content as string)
        } else if (event.type === 'done') {
          result = {
            conversationId: event.conversationId ?? null,
            usageToday: event.usageToday ?? 0,
            usageLeft: event.usageLeft ?? 0,
            usageLimit: event.usageLimit ?? 20,
          }
        } else if (event.type === 'error') {
          throw new Error(event.message ?? 'Stream error')
        }
      } catch {
        // skip unparseable lines
      }
    }
  }

  return result
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

export interface Subscription {
  tier: 'free' | 'premium'
  plan: Plan
  status: string
  currentPeriodEnd: string
}

export async function getPlans(): Promise<Plan[]> {
  const res = await fetch(`${BACKEND_URL}/api/billing/plans`)
  if (!res.ok) throw new Error('Failed to fetch plans')
  const data = await res.json()
  return data.plans
}

export async function getSubscription(): Promise<Subscription> {
  const headers = await authHeaders()
  const res = await fetch(`${BACKEND_URL}/api/billing/subscription`, { headers })
  if (!res.ok) throw new Error('Failed to fetch subscription')
  return res.json()
}

export async function upgradeToPremium(): Promise<{ tier: 'premium'; message: string }> {
  const headers = await authHeaders()
  const res = await fetch(`${BACKEND_URL}/api/billing/upgrade`, { method: 'POST', headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Upgrade failed')
  return body
}

export async function downgradeToFree(): Promise<{ tier: 'free'; message: string }> {
  const headers = await authHeaders()
  const res = await fetch(`${BACKEND_URL}/api/billing/downgrade`, { method: 'POST', headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Downgrade failed')
  return body
}

// ─── Usage ────────────────────────────────────────────────────────────────────

export interface UsageStatus {
  tier: 'anonymous' | 'free' | 'premium'
  usageToday: number
  usageLimit: number
  usageLeft: number
  resetAt: string
}

export async function getUsageStatus(): Promise<UsageStatus> {
  const headers = await authHeaders()
  const res = await fetch(`${BACKEND_URL}/api/usage`, { headers })
  if (!res.ok) throw new Error('Failed to fetch usage')
  return res.json()
}
