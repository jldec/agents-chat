import { ChatAgent } from './app/chat-agent/ChatAgent'
import { chatAgentApiRoutes } from './app/chat-agent/api-routes'
import { ChatRSC } from './app/chat-rsc/ChatRSC'
import { ChatTinybase } from './app/chat-tinybase/ChatTinybase'
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

export { ChatDurableObject } from './app/shared/ChatStore'
export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { ChatAgentDurableObject } from './app/chat-agent/ChatAgentDO'
export { TinyBaseDurableObject } from './app/chat-tinybase/tinybaseDO'

export default defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  render(Document, [
    index(Home),
    route('/chat-rsc', ChatRSC), // realtime RSC
    route('/chat-agent', ChatAgent), // client-side react app
    route('/chat-tinybase', ChatTinybase), // client-side react app
    route('/time', Time) // realtime RSC
  ]),
  ...chatAgentApiRoutes,
  ...tinybaseApiRoutes,
  ...timeApiRoutes,
  ...redirectRoutes([
    { from: '/chat', to: '/chat-rsc' },
    { from: '/chat-client', to: '/chat-agent' }
  ]),
  route('/echo', echoHandler)
])
