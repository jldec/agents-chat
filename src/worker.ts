import { ChatAgent } from './app/chat-agent/ChatAgent'
import { chatAgentApiRoutes } from './app/chat-agent/api-routes'
import { ChatRSC } from './app/chat-rsc/ChatRSC'
import { ChatTinybase } from './app/chat-tinybase/ChatTinybase'
import { ChatAgentAgent } from './app/chat-agent-agent/ChatAgentAgent'
import { ChatAgentSDK } from './app/chat-agent-sdk/ChatAgentSDK'
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

const app = defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  render(Document, [
    index(Home),
    route('/chat-rsc', ChatRSC), // realtime RSC
    route('/chat-agent', ChatAgent),
    route('/chat-tinybase', ChatTinybase),
    route('/time', Time) // realtime RSC
  ]),
  render(Document, [route('/chat-agent-sdk', ChatAgentSDK), route('/chat-agent-agent', ChatAgentAgent)], {
    ssr: false
  }),
  // handle websockets for /chat-agent, /chat-agent-sdk, /chat-agent-agent
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

export default {
  fetch: async (request, env, ctx) => {
    const url = new URL(request.url)
    let cache: Cache | undefined = undefined

    try {
      // check cache on specific routes, GET only
      if (url.pathname === '/time' && request.method === 'GET') {
        cache = await caches.open('default')
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          console.log('cache hit', url.pathname)
          return cachedResponse
        }
      }
      // perform expensive render
      let response = await app.fetch(request, env, ctx)
      // set cache if we checked it earlier and if response is ok
      if (cache && response.status === 200) {
        response = new Response(response.body, response)
        response.headers.append('Cache-Control', 's-maxage=3600')
        console.log('cache set', url.pathname)
        ctx.waitUntil(cache.put(request, response.clone()))
      }
      return response
    } catch (error: any) {
      console.error(error)
      return new Response(error.stack || error.message || 'Internal Server Error', { status: 500 })
    }
  }
} satisfies ExportedHandler<Env>
