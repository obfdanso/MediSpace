/**
 * POST /api/billing/webhook
 * Paystack calls this when a payment succeeds, even if the user closed the tab
 * (common with Mobile Money). The signature proves it came from Paystack.
 */
import { json } from '../_lib/server'
import { confirmPayment, validSignature } from '../_lib/paystack'

export async function POST(req: Request): Promise<Response> {
  const raw = await req.text()
  if (!(await validSignature(raw, req.headers.get('x-paystack-signature')))) {
    console.error('[paystack] webhook signature did not match')
    return json({ error: 'Invalid signature.' }, 401)
  }

  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(raw)
  } catch {
    return json({ error: 'Invalid body.' }, 400)
  }

  if (event.event === 'charge.success' && event.data?.reference) {
    const result = await confirmPayment(event.data.reference)
    console.log('[paystack] webhook', event.data.reference, result.status)
    // A 500 makes Paystack retry later; only do that when retrying could help
    if (result.status === 'error') return json({ received: false }, 500)
  }
  return json({ received: true })
}
