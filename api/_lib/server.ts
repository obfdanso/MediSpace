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

const LIMITS: Record<Tier, number> = {
  anonymous: Number(env('RATE_LIMIT_ANONYMOUS') ?? 3),
  free: Number(env('RATE_LIMIT_FREE') ?? 20),
  premium: Number(env('RATE_LIMIT_PREMIUM') ?? 100),
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

export async function getTodayUsage(caller: Caller): Promise<number> {
  if (!db) return 0
  let query = db.from('daily_usage').select('message_count').eq('date', today())
  query = caller.userId
    ? query.eq('user_id', caller.userId)
    : query.eq('ip_address', caller.ip).is('user_id', null)
  const { data } = await query.maybeSingle()
  return data?.message_count ?? 0
}

export async function incrementUsage(caller: Caller) {
  if (!db) return
  if (caller.userId) {
    await db.rpc('increment_daily_usage_user', { p_user_id: caller.userId, p_date: today() })
  } else {
    await db.rpc('increment_daily_usage_ip', { p_ip: caller.ip, p_date: today() })
  }
}
