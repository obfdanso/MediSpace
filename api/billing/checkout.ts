/** POST /api/billing/checkout: starts a Paystack payment for a Premium pass. */
import { env, json, getCaller } from '../_lib/server'
import { paystackKey, startCheckout } from '../_lib/paystack'

export async function POST(req: Request): Promise<Response> {
  if (!paystackKey()) return json({ error: 'Payments are not set up yet.' }, 503)

  const caller = await getCaller(req)
  if (!caller.userId) return json({ error: 'Please sign in first.' }, 401)
  if (!caller.email) return json({ error: 'Your account needs an email address to pay.' }, 400)

  const site = env('SITE_URL') ?? new URL(req.url).origin
  const checkout = await startCheckout(caller.userId, caller.email, `${site}/billing`)
  if (!checkout) return json({ error: 'Could not start the payment. Please try again.' }, 502)
  return json(checkout)
}
