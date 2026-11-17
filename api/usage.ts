/**
 * GET /api/usage
 * How many messages the caller has left today, so the page shows the
 * server's real count instead of guessing.
 */
import { json, getCaller, getLimit, getTodayUsage } from './_lib/server'

export async function GET(req: Request): Promise<Response> {
  const caller = await getCaller(req)
  const limit = getLimit(caller.tier)
  const used = await getTodayUsage(caller)
  return json({ usageToday: used, usageLimit: limit, usageLeft: Math.max(0, limit - used) })
}
