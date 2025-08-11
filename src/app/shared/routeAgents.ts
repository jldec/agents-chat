import { routeAgentRequest } from 'agents'
import type { RequestInfo } from 'rwsdk/worker'
import { env } from 'cloudflare:workers'

export type routeAgentsOptions = {
  prefix?: string | string[]
}

export function routeAgents({ prefix = '/agents/' }: routeAgentsOptions = {}) {
  return async ({ request }: RequestInfo) => {
    const pathname = new URL(request.url).pathname
    const prefixArray = Array.isArray(prefix) ? prefix : [prefix]
    if (!prefixArray.some((p) => pathname.startsWith(p))) {
      return
    }

    const response = await routeAgentRequest(request, env)
    if (response) {
      return response
    }
  }
}
