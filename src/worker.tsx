import { cacheInterrupter, cacheResponse } from './lib/cacheInterrupter'
import { ChatAgent } from './app/chat-agent/ChatAgent'
import { ChatAgentAgent } from './app/chat-agent-agent/ChatAgentAgent'
import { chatAgentApiRoutes } from './app/chat-agent/api-routes'
import { ChatAgentSDK } from './app/chat-agent-sdk/ChatAgentSDK'
import { ChatRSC } from './app/chat-rsc/ChatRSC'
import { ChatTinybase } from './app/chat-tinybase/ChatTinybase'
import { contentRouteHandler } from './app/content/routeHandler'
import { defineApp } from 'rwsdk/worker'
import { Document } from './app/Document'
import { echoHandler } from './lib/echo'
import { env } from 'cloudflare:workers'
import { render, route } from 'rwsdk/router'
import { realtimeRoute } from 'rwsdk/realtime/worker'
import { redirectRoutes } from './lib/redirects'
import { routeAgentRequest } from 'agents'
import { Time } from './app/time/Time'
import { timeApiRoutes } from './app/time/api-routes'
import { tinybaseApiRoutes } from './app/chat-tinybase/api-routes'

export { ChatDurableObject } from './app/shared/ChatStore'
export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { WebsocketAgent } from './app/chat-agent/WebsocketAgent'
export { ChatAgentSDKDO } from './app/chat-agent-sdk/ChatAgentSDKDO'
export { ChatAgentAgentDO } from './app/chat-agent-agent/ChatAgentAgentDO'
export { TinyBaseDurableObject } from './app/chat-tinybase/tinybaseDO'

export type AppContext = {}

const app = defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  render(Document, [
    // index(Home),
    route('/chat-rsc', [cacheInterrupter, ChatRSC]),
    route('/chat-agent', [cacheInterrupter, ChatAgent]),
    route('/chat-tinybase', [cacheInterrupter, ChatTinybase]),
    route('/time', [cacheInterrupter, Time])
  ]),
  render(
    Document,
    [
      route('/chat-agent-sdk', [cacheInterrupter, ChatAgentSDK]),
      route('/chat-agent-agent', [cacheInterrupter, ChatAgentAgent])
    ],
    { ssr: false }
  ),
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
  route('/echo', echoHandler),
  render(Document, [route('*', [cacheInterrupter, contentRouteHandler])])
])

export default {
  fetch: cacheResponse(app.fetch)
}
