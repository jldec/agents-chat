import { defineApp } from 'rwsdk/worker'
import { index, render, route } from 'rwsdk/router'
import { realtimeRoute } from 'rwsdk/realtime/worker'
import { Document } from './app/Document'
import { Home } from './app/Home'
import { ChatRSC } from './app/chat-rsc/ChatRSC'
import { ChatAgent } from './app/chat-agent/ChatAgent'
import { chatAgentApiRoutes } from './app/chat-agent/api-routes'
import { Time } from './app/time/Time'
import { timeApiRoutes } from './app/time/api-routes'
import { env } from 'cloudflare:workers'
import { routeAgentRequest } from 'agents'
import { redirectRoutes } from './app/utils/redirects'

export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { ChatDurableObject } from './app/chat/ChatStore'
export { WebsocketAgent } from './app/chat-agent/WebsocketAgent'

export default defineApp([
  // https://developers.cloudflare.com/agents/api-reference/calling-agents/
  route(`/agents/${env.WEBSOCKET_AGENT_PATH}/${env.WEBSOCKET_AGENT_NAME}`, async ({ request }) => {
    return (await routeAgentRequest(request, env)) || Response.json({ msg: 'no agent here' }, { status: 404 })
  }),
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  render(Document, [
    index(Home),
    route('/chat-rsc', ChatRSC), // realtime RSC
    route('/chat-agent', ChatAgent), // client-side react app
    route('/time', Time) // realtime RSC
  ]),
  ...chatAgentApiRoutes,
  ...timeApiRoutes,
  ...redirectRoutes([
    { from: '/chat', to: '/chat-rsc' },
    { from: '/chat-client', to: '/chat-agent' }
  ])
])
