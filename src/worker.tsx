// prettier-ignore
import { routeAgents } from './app/shared/routeAgents'
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
export { OpenaiChatstoreDurableObject } from './app/shared/OpenaiChatStore'
export { RealtimeDurableObject } from 'rwsdk/realtime/durableObject'
export { WebsocketAgent } from './app/chat-agent/WebsocketAgent'
export { ChatAgentSDKDO } from './app/chat-agent-sdk/ChatAgentSDKDO'
export { ChatAgentAgentDO } from './app/chat-agent-agent/ChatAgentAgentDO'
export { TinyBaseDurableObject } from './app/chat-tinybase/tinybaseDO'

import type { ContentPageContext } from './app/contentSource/types'
import { ContentLayout } from './app/contentTheme/ContentLayout'
import { contentMiddleware } from './app/contentSource/contentMiddleware'
import { contentTheme } from './app/contentTheme/contentTheme'
import { contentApiRoutes } from './app/contentSource/api-routes'
import { ChatOpenaiRSC } from './app/chat-openai-rsc/ChatOpenaiRSC'

export type AppContext = {
  pageContext?: ContentPageContext
}

export const AppLayout = ({ children }: LayoutProps) => <ContentLayout>{children}</ContentLayout>

const app = defineApp([
  realtimeRoute(() => env.REALTIME_DURABLE_OBJECT),
  routeAgents({ prefix: '/agents/' }),
  contentMiddleware({ ignore: '/api/' }),
  render(
    Document,
    layout(AppLayout, [
      route('/chat-rsc', ChatRSC),
      route('/chat-openai-rsc', ChatOpenaiRSC),
      route('/chat-agent', ChatAgent),
      route('/chat-tinybase', ChatTinybase),
      route('/time', Time)
    ])
  ),
  render(
    Document,
    layout(AppLayout, [
      // useAgentChat doesn't play well with SSR
      route('/chat-agent-sdk', ChatAgentSDK),
      route('/chat-agent-agent', ChatAgentAgent)
    ]),
    { ssr: false }
  ),
  ...chatAgentApiRoutes,
  ...tinybaseApiRoutes,
  ...timeApiRoutes,
  ...contentApiRoutes,
  render(Document, [route('*', contentTheme)])
])

export default {
  fetch: app.fetch
}
