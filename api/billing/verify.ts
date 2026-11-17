/**
 * GET /api/billing/verify?reference=...
 * Called when the user returns from Paystack, so Premium shows up right away
 * instead of waiting for the webhook.
 */
import { json, getCaller } from '../_lib/server'
import { confirmPayment, paystackKey } from '../_lib/paystack'

export async function GET(req: Request): Promise<Response> {
  if (!paystackKey()) return json({ error: 'Payments are not set up yet.' }, 503)

  const caller = await getCaller(req)
  if (!caller.userId) return json({ error: 'Please sign in first.' }, 401)

  const reference = new URL(req.url).searchParams.get('reference') ?? ''
  const result = await confirmPayment(reference, caller.userId)
  return json(result, result.status === 'credited' || result.status === 'pending' ? 200 : 400)
}
