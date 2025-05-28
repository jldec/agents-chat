import { defineApp } from 'rwsdk/worker'
import { index, render, route } from 'rwsdk/router'
import { realtimeRoute } from 'rwsdk/realtime/worker'
import { Document } from './app/Document'
import { Home } from './app/Home'
import { Chat } from './app/chat/Chat'
import { Time } from './app/time/Time'
import { timeApi } from './app/time/api'
import { env } from 'cloudflare:workers'
import { routeAgentRequest } from 'agents'

export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { ChatDurableObject } from './app/chat/ChatStore'
export { WebsocketAgent } from './app/chat/WebsocketAgent'

export default defineApp([
  // https://developers.cloudflare.com/agents/api-reference/calling-agents/
  route('/agents/*', async ({ request }) => {
    return (await routeAgentRequest(request, env)) || Response.json({ msg: 'no agent here' }, { status: 404 })
  }),
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  render(Document, [
    index(Home),
    route('/chat', Chat), // realtime RSC
    route('/chat-client', Chat), // client-side react app
    route('/time', Time) // realtime RSC
  ]),
  ...timeApi
])
