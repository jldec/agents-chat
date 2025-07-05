import { agentsRoute } from './app/shared/agentsRoute'
import { cacheInterrupter, cacheResponse } from './lib/cacheInterrupter'
import { ChatAgent } from './app/chat-agent/ChatAgent'
import { ChatAgentAgent } from './app/chat-agent-agent/ChatAgentAgent'
import { chatAgentApiRoutes } from './app/chat-agent/api-routes'
import { ChatAgentSDK } from './app/chat-agent-sdk/ChatAgentSDK'
import { ChatRSC } from './app/chat-rsc/ChatRSC'
import { ChatTinybase } from './app/chat-tinybase/ChatTinybase'
import { defineApp } from 'rwsdk/worker'
import { Document } from './app/Document'
import { env } from 'cloudflare:workers'
import { render, route, layout, type LayoutProps } from 'rwsdk/router'
import { realtimeRoute } from 'rwsdk/realtime/worker'
import { Time } from './app/time/Time'
import { timeApiRoutes } from './app/time/api-routes'
import { tinybaseApiRoutes } from './app/chat-tinybase/api-routes'

import type { ContentPageContext } from './app/contentSource/types'
import { ContentLayout } from './app/contentTheme/ContentLayout'
import { contentRoutes } from './app/contentSource/routes'
import { contentTheme } from './app/contentTheme/routes'

export { ChatDurableObject } from './app/shared/ChatStore'
export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { WebsocketAgent } from './app/chat-agent/WebsocketAgent'
export { ChatAgentSDKDO } from './app/chat-agent-sdk/ChatAgentSDKDO'
export { ChatAgentAgentDO } from './app/chat-agent-agent/ChatAgentAgentDO'
export { TinyBaseDurableObject } from './app/chat-tinybase/tinybaseDO'

export type AppContext = {
  pageContext?: ContentPageContext
}

export const AppLayout = ({ children }: LayoutProps) => <ContentLayout>{children}</ContentLayout>

const app = defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  agentsRoute,
  render(
    Document,
    layout(AppLayout, [
      route('/chat-rsc', [cacheInterrupter, contentRoutes, ChatRSC]),
      route('/chat-agent', [cacheInterrupter, contentRoutes, ChatAgent]),
      route('/chat-tinybase', [cacheInterrupter, contentRoutes, ChatTinybase]),
      route('/time', [cacheInterrupter, contentRoutes, Time])
    ])
  ),
  render(
    Document,
    layout(AppLayout, [
      route('/chat-agent-sdk', [cacheInterrupter, contentRoutes, ChatAgentSDK]),
      route('/chat-agent-agent', [cacheInterrupter, contentRoutes, ChatAgentAgent])
    ]),
    { ssr: false } // useAgentChat doesn't play well with SSR
  ),
  ...chatAgentApiRoutes,
  ...tinybaseApiRoutes,
  ...timeApiRoutes,
  render(Document, [route('*', [cacheInterrupter, contentRoutes, contentTheme])])
])

export default {
  fetch: cacheResponse(app.fetch)
}
