// prettier-ignore
import { env } from 'cloudflare:workers'
import { defineApp } from 'rwsdk/worker'
import { realtimeRoute } from 'rwsdk/realtime/worker'
import { render, route, layout } from 'rwsdk/router'

import { ChatRSC } from './app/chat-rsc/ChatRSC'
import { Document } from './app/Document'
import { Time } from './app/time/Time'
import { timeApiRoutes } from './app/time/api-routes'

export { ChatDurableObject } from './lib/ChatStore'
export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'

import type { ContentPageContext } from './app/contentSource/types'
import { ContentLayout } from './app/contentTheme/ContentLayout'
import { contentMiddleware } from './app/contentSource/contentMiddleware'
import { contentTheme } from './app/contentTheme/contentTheme'
import { contentApiRoutes } from './app/contentSource/api-routes'

export type AppContext = {
  pageContext?: ContentPageContext
}

const app = defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  contentMiddleware({ ignore: '/api/' }),
  render(
    Document,
    layout(ContentLayout, [
      route('/chat-rsc', ChatRSC),
      route('/time', Time)
    ])
  ),
  ...timeApiRoutes,
  ...contentApiRoutes,
  render(Document, [route('*', contentTheme)])
])

export default {
  fetch: app.fetch
}
