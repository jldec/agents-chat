import { env } from 'cloudflare:workers'
import { route } from 'rwsdk/router'
import { routeAgentRequest } from 'agents'

export const chatAgentApiRoutes = [
  // https://developers.cloudflare.com/agents/api-reference/calling-agents/
  route(`/agents/${env.CHAT_AGENT_PATH}/${env.CHAT_AGENT_NAME}`, async ({ request }) => {
    return (await routeAgentRequest(request, env)) || Response.json({ msg: 'no agent here' }, { status: 404 })
  })
]
