import { db, getLimit, json, getCaller } from './server'

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    messagesPerDay: getLimit('free'),
    features: [`${getLimit('free')} AI messages per day`, 'Save chat history', 'Health profile', 'All health topics'],
    unavailable: ['Priority support', 'Extended context window'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    messagesPerDay: getLimit('premium'),
    features: [`${getLimit('premium')} AI messages per day`, 'Save chat history', 'Health profile', 'All health topics', 'Priority support', 'Extended context window'],
    unavailable: [],
  },
] as const

/** Switches the caller's plan. There is no payment step yet. */
export async function switchPlan(req: Request, to: 'free' | 'premium'): Promise<Response> {
  const caller = await getCaller(req)
  if (!db || !caller.userId) return json({ error: 'Please sign in first.' }, 401)
  if (caller.tier === to) {
    return json({ error: to === 'premium' ? 'Already on the Premium plan.' : 'Already on the Free plan.' }, 400)
  }
  const { data: updated, error } = await db
    .from('profiles').update({ tier: to }).eq('id', caller.userId).select('id')
  if (error || !updated?.length) return json({ error: 'Could not change your plan. Please try again.' }, 500)
  return json({
    success: true,
    message: to === 'premium' ? 'Upgraded to Premium successfully.' : 'Downgraded to Free plan.',
    tier: to,
    plan: PLANS.find(p => p.id === to),
  })
}
