/**
 * POST /api/billing/webhook
 * Paystack calls this when a payment succeeds, even if the user closed the tab
 * (common with Mobile Money).
 *
 * Nothing in the webhook body is trusted: only its reference is used, and
 * confirmPayment asks Paystack directly whether that payment succeeded. So a
 * forged webhook can't grant Premium. Paystack signs webhooks with the account's
 * secret key; while only a restricted key is available the signature can't be
 * checked, so unsigned calls are accepted only for references this site creates.
 */
import { json } from '../_lib/server'
import { confirmPayment, validSignature } from '../_lib/paystack'

const OUR_REFERENCE = /^ms_[a-f0-9]{32}$/

export async function POST(req: Request): Promise<Response> {
  const raw = await req.text()

  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(raw)
  } catch {
    return json({ error: 'Invalid body.' }, 400)
  }

  const reference = event.data?.reference ?? ''
  const signed = await validSignature(raw, req.headers.get('x-paystack-signature'))
  if (!signed && !OUR_REFERENCE.test(reference)) {
    console.error('[paystack] webhook rejected: unsigned and not our reference')
    return json({ error: 'Invalid signature.' }, 401)
  }

  if (event.event === 'charge.success' && reference) {
    const result = await confirmPayment(reference)
    console.log('[paystack] webhook', reference, result.status, signed ? 'signed' : 'unsigned')
    // A 500 makes Paystack retry later; only do that when retrying could help
    if (result.status === 'error') return json({ received: false }, 500)
  }
  return json({ received: true })
}
