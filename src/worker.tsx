// prettier-ignore
import { ChatAgent } from './app/chat-agent/ChatAgent'
import { ChatAgentWithContentLayout } from './app/chat-agent/ChatAgentWithContentLayout'
import { chatAgentApiRoutes } from './app/chat-agent/api-routes'
import { defineApp } from 'rwsdk/worker'
import { Document } from './app/Document'
import { render, route, layout, type LayoutProps } from 'rwsdk/router'

export { ChatDurableObject } from './app/shared/ChatStore'
export { WebsocketAgent } from './app/chat-agent/WebsocketAgent'

import type { ContentPageContext } from './app/contentSource/types'
import { ContentLayout } from './app/contentTheme/ContentLayout'
import { contentMiddleware } from './app/contentSource/contentMiddleware'
import { contentTheme } from './app/contentTheme/contentTheme'
import { contentApiRoutes } from './app/contentSource/api-routes'

export type AppContext = {
  pageContext?: ContentPageContext
}

export const AppLayoutWithContentLayout = ({ children }: LayoutProps) => <ContentLayout>{children}</ContentLayout>

const app = defineApp([
  contentMiddleware({ ignore: '/api/' }),
  render(
    Document,
    layout(AppLayoutWithContentLayout, [
      route('/chat-agent', ChatAgent),
    ])
  ),
  render(
    Document,
    [route('/chat-agent-with-content-layout', ChatAgentWithContentLayout)]
  ),
  ...chatAgentApiRoutes,
  ...contentApiRoutes,
  render(Document, [route('*', contentTheme)])
])

export default {
  fetch: app.fetch
}
