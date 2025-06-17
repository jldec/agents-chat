import { ChatAgent } from './app/chat-agent/ChatAgent'
import { chatAgentApiRoutes } from './app/chat-agent/api-routes'
import { ChatRSC } from './app/chat-rsc/ChatRSC'
import { ChatTinybase } from './app/chat-tinybase/ChatTinybase'
import { ClientOnlyChatAgentAgent } from './app/chat-agent-agent/ChatAgentAgent'
import { ClientOnlyChatAgentSDK } from './app/chat-agent-sdk/ChatAgentSDK'
import { defineApp } from 'rwsdk/worker'
import { Document } from './app/Document'
import { echoHandler } from './lib/echo'
import { env } from 'cloudflare:workers'
import { Home } from './app/Home'
import { index, render, route } from 'rwsdk/router'
import { realtimeRoute } from 'rwsdk/realtime/worker'
import { redirectRoutes } from './lib/redirects'
import { Time } from './app/time/Time'
import { timeApiRoutes } from './app/time/api-routes'
import { tinybaseApiRoutes } from './app/chat-tinybase/api-routes'
import { routeAgentRequest } from 'agents'

export { ChatDurableObject } from './app/shared/ChatStore'
export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { WebsocketAgent } from './app/chat-agent/WebsocketAgent'
export { ChatAgentSDKDO } from './app/chat-agent-sdk/ChatAgentSDKDO'
export { ChatAgentAgentDO } from './app/chat-agent-agent/ChatAgentAgentDO'
export { TinyBaseDurableObject } from './app/chat-tinybase/tinybaseDO'

export default defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  render(Document, [
    index(Home),
    route('/chat-rsc', ChatRSC), // realtime RSC
    route('/chat-agent', ChatAgent), // client-side react app
    route('/chat-agent-sdk', ClientOnlyChatAgentSDK), // client-side react app
    route('/chat-agent-agent', ClientOnlyChatAgentAgent), // client-side react app
    route('/chat-tinybase', ChatTinybase), // client-side react app
    route('/time', Time) // realtime RSC
  ]),
  // handle requests for both /chat-agent and /chat-agent-sdk
  async ({ request }) => {
    const response = await routeAgentRequest(request, env)
    if (response) {
      return response
    }
  },
  ...chatAgentApiRoutes,
  ...tinybaseApiRoutes,
  ...timeApiRoutes,
  ...redirectRoutes([
    { from: '/chat', to: '/chat-rsc' },
    { from: '/chat-client', to: '/chat-agent' }
  ]),
  route('/echo', echoHandler)
])
