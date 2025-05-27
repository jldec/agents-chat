import { defineApp } from 'rwsdk/worker'
import { index, render, route } from 'rwsdk/router'
import { realtimeRoute } from 'rwsdk/realtime/worker'
import { Document } from './app/Document'
import { Home } from './app/Home'
import { Chat } from './app/chat/Chat'
import { Time } from './app/time/Time'
import { timeApi } from './app/time/api'
import { env } from 'cloudflare:workers'

export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { ChatDurableObject } from './app/chat/ChatStore'

export default defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  render(Document, [
    index(Home),
    route('/chat', Chat),
    route('/time', Time)
  ]),
  ...timeApi
])
