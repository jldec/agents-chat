import { type RequestInfo } from 'rwsdk/worker'
import { NotFound } from './404'
import { Page } from './Page'
import { Home } from './Home'
import { BlogList } from './BlogList'

// Default template for markdown pages
export function contentTheme({ ctx }: RequestInfo) {
  if (ctx.pageContext) {
    switch (ctx.pageContext.pathname) {
      case '/':
        return <Home />
      case '/blog':
        return <BlogList />
      default:
        return <Page />
    }
  }
  else return <NotFound />
}
