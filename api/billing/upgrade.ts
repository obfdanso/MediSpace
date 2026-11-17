import { switchPlan } from '../_lib/plans'

export function POST(req: Request): Promise<Response> {
  return switchPlan(req, 'premium')
}
