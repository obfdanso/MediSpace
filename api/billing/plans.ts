import { PLANS } from '../_lib/plans'
import { json } from '../_lib/server'

export function GET(): Response {
  return json({ plans: PLANS })
}
