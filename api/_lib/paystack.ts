/**
 * Paystack helpers. Premium is only ever granted from confirmPayment, which
 * asks Paystack itself whether the payment succeeded; nothing the browser
 * sends can grant it.
 */
import { db, env } from './server'
import { PREMIUM_DAYS, PREMIUM_PRICE_PESEWAS } from './plans'

const API = 'https://api.paystack.co'

export const paystackKey = () => env('PAYSTACK_SECRET_KEY') ?? null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PaystackBody = { status?: boolean; message?: string; data?: any }

async function paystack(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paystackKey()}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  })
  const body = (await res.json().catch(() => ({}))) as PaystackBody
  return { ok: res.ok && body.status === true, body }
}

/** Starts a Paystack checkout and returns the page to send the user to. */
export async function startCheckout(userId: string, email: string, callbackUrl: string) {
  const reference = `ms_${crypto.randomUUID().replace(/-/g, '')}`
  const { ok, body } = await paystack('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email,
      amount: String(PREMIUM_PRICE_PESEWAS),
      currency: 'GHS',
      reference,
      callback_url: callbackUrl,
      channels: ['card', 'mobile_money'],
      metadata: { user_id: userId, product: 'premium_pass', days: PREMIUM_DAYS },
    }),
  })
  if (!ok || !body.data?.authorization_url) {
    console.error('[paystack] initialize failed', body.message)
    return null
  }
  return { url: body.data.authorization_url as string, reference }
}

export type ConfirmResult =
  | { status: 'credited'; premiumUntil: string }
  | { status: 'pending' | 'failed' | 'mismatch' | 'error'; message: string }

const PENDING = new Set(['abandoned', 'ongoing', 'pending', 'processing', 'queued'])

/**
 * Asks Paystack whether a payment succeeded and, if so, credits Premium.
 * Safe to call many times for the same reference.
 */
export async function confirmPayment(reference: string, expectedUserId?: string): Promise<ConfirmResult> {
  if (!db) return { status: 'error', message: 'Database not configured.' }
  if (!/^[A-Za-z0-9_\-.=]{6,100}$/.test(reference)) return { status: 'error', message: 'Invalid payment reference.' }

  const { ok, body } = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`)
  if (!ok || !body.data) return { status: 'error', message: 'Could not check the payment with Paystack.' }

  const tx = body.data
  if (PENDING.has(tx.status)) return { status: 'pending', message: 'Your payment is still processing.' }
  if (tx.status !== 'success') return { status: 'failed', message: 'The payment did not go through.' }

  const userId: string | undefined = tx.metadata?.user_id
  if (!userId || (expectedUserId && userId !== expectedUserId)) {
    return { status: 'mismatch', message: 'This payment belongs to another account.' }
  }
  if (tx.currency !== 'GHS' || Number(tx.amount) < PREMIUM_PRICE_PESEWAS) {
    console.error('[paystack] amount mismatch', reference, tx.amount, tx.currency)
    return { status: 'mismatch', message: 'The amount paid does not match the Premium price.' }
  }

  // The pass length always comes from the server's own setting, never from
  // payment metadata, which a payment made outside this site could set
  const { data, error } = await db.rpc('credit_premium', {
    p_reference: reference,
    p_user_id: userId,
    p_amount: Number(tx.amount),
    p_currency: tx.currency,
    p_days: PREMIUM_DAYS,
  })
  if (error || !data) {
    console.error('[paystack] credit failed', reference, error?.message)
    return { status: 'error', message: 'Payment received, but Premium could not be activated yet. It will retry automatically.' }
  }
  return { status: 'credited', premiumUntil: data as string }
}

/** Checks the x-paystack-signature header (HMAC-SHA512 of the raw body). */
export async function validSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = paystackKey()
  if (!secret || !signature) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(rawBody)))
  const expected = Array.from(mac, b => b.toString(16).padStart(2, '0')).join('')
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  return diff === 0
}
