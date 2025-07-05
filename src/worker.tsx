import { agentsRoute } from './app/shared/agentsRoute'
import { cacheInterrupter as cache, cacheResponse } from './lib/cacheInterrupter'
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

export { ChatDurableObject } from './app/shared/ChatStore'
export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { WebsocketAgent } from './app/chat-agent/WebsocketAgent'
export { ChatAgentSDKDO } from './app/chat-agent-sdk/ChatAgentSDKDO'
export { ChatAgentAgentDO } from './app/chat-agent-agent/ChatAgentAgentDO'
export { TinyBaseDurableObject } from './app/chat-tinybase/tinybaseDO'

import type { ContentPageContext } from './app/contentSource/types'
import { ContentLayout } from './app/contentTheme/ContentLayout'
import { contentMiddleware as content } from './app/contentSource/contentMiddleware'
import { contentTheme as theme } from './app/contentTheme/contentTheme'

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
      route('/chat-rsc', [cache, content, ChatRSC]),
      route('/chat-agent', [cache, content, ChatAgent]),
      route('/chat-tinybase', [cache, content, ChatTinybase]),
      route('/time', [cache, content, Time])
    ])
  ),
  render(
    Document,
    layout(AppLayout, [
      route('/chat-agent-sdk', [cache, content, ChatAgentSDK]),
      route('/chat-agent-agent', [cache, content, ChatAgentAgent])
    ]),
    { ssr: false } // useAgentChat doesn't play well with SSR
  ),
  ...chatAgentApiRoutes,
  ...tinybaseApiRoutes,
  ...timeApiRoutes,
  render(Document, [route('*', [cache, content, theme])])
])

export default {
  fetch: cacheResponse(app.fetch)
}
