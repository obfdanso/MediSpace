import { env, getLimit } from './server'

const positive = (name: string, fallback: number) => {
  const n = Number(env(name))
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Price of one Premium pass in cedis, and how many days it lasts. */
export const PREMIUM_PRICE_GHS = positive('PREMIUM_PRICE_GHS', 30)
export const PREMIUM_DAYS = Math.round(positive('PREMIUM_DAYS', 30))
/** Paystack amounts are in pesewas (1 cedi = 100 pesewas). */
export const PREMIUM_PRICE_PESEWAS = Math.round(PREMIUM_PRICE_GHS * 100)

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'GHS',
    interval: `${PREMIUM_DAYS} days`,
    messagesPerDay: getLimit('free'),
    features: [`${getLimit('free')} AI messages per day`, 'Save chat history', 'Health profile', 'All health topics'],
    unavailable: [`${getLimit('premium')} AI messages per day`],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: PREMIUM_PRICE_GHS,
    currency: 'GHS',
    interval: `${PREMIUM_DAYS} days`,
    messagesPerDay: getLimit('premium'),
    features: [`${getLimit('premium')} AI messages per day`, 'Save chat history', 'Health profile', 'All health topics', 'Pay with card or Mobile Money'],
    unavailable: [],
  },
] as const
