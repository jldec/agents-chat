import { routeAgentRequest } from 'agents'
import type { RequestInfo } from 'rwsdk/worker'
import { env } from 'cloudflare:workers'

export async function agentsRoute({ request }: RequestInfo) {
  const response = await routeAgentRequest(request, env)
  if (response) {
    return response
  }
}
