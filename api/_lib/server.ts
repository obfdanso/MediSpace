/**
 * Shared helpers for the serverless API: the Supabase admin client,
 * who is calling (signed in or not), and the daily message limits.
 * Files under api/_lib are not exposed as routes by Vercel.
 */
import { createClient } from '@supabase/supabase-js'

declare const process: { env: Record<string, string | undefined> }

export const env = (name: string) => process.env[name]

const supabaseUrl = env('SUPABASE_URL') ?? env('VITE_SUPABASE_URL')
const supabaseKey = env('SUPABASE_SECRET_KEY') ?? env('SUPABASE_SERVICE_ROLE_KEY')

// Service key: bypasses RLS, so it only ever lives on the server
export const db = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null

export type Tier = 'anonymous' | 'free' | 'premium'

// An empty or invalid setting falls back to the default instead of becoming 0
const limitFromEnv = (name: string, fallback: number) => {
  const n = Number.parseInt(env(name) ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

const LIMITS: Record<Tier, number> = {
  anonymous: limitFromEnv('RATE_LIMIT_ANONYMOUS', 3),
  free: limitFromEnv('RATE_LIMIT_FREE', 20),
  premium: limitFromEnv('RATE_LIMIT_PREMIUM', 100),
}

export const getLimit = (tier: Tier) => LIMITS[tier]

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export interface Caller {
  userId: string | null
  tier: Tier
  ip: string
}

/** Works out who sent the request from the Supabase access token, if any. */
export async function getCaller(req: Request): Promise<Caller> {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  const auth = req.headers.get('authorization')
  if (!db || !auth?.startsWith('Bearer ')) return { userId: null, tier: 'anonymous', ip }

  const { data, error } = await db.auth.getUser(auth.slice(7))
  if (error || !data.user) return { userId: null, tier: 'anonymous', ip }

  const { data: profile } = await db.from('profiles').select('tier').eq('id', data.user.id).maybeSingle()
  return { userId: data.user.id, tier: profile?.tier === 'premium' ? 'premium' : 'free', ip }
}

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Atomically claims one message from today's allowance.
 * Returns the new count, or null if the limit was already reached.
 */
export async function reserveMessage(caller: Caller, limit: number): Promise<number | null> {
  if (!db) return 1 // no database configured: limits can't be tracked
  const { data, error } = await db.rpc('try_use_message', {
    p_user_id: caller.userId, p_ip: caller.ip, p_date: today(), p_limit: limit,
  })
  if (error) throw error
  return typeof data === 'number' ? data : null
}

/** Hands back a claimed message when the AI call fails. */
export async function refundMessage(caller: Caller) {
  if (!db) return
  await db.rpc('refund_message', { p_user_id: caller.userId, p_ip: caller.ip, p_date: today() })
}
