import { type RequestInfo } from 'rwsdk/worker'
import { NotFound } from './404'
import { Page } from './Page'
import { Home } from './Home'
import { BlogList } from './BlogList'
import { BlogPost } from './BlogPost'

export function contentTheme({ ctx }: RequestInfo) {
  if (ctx.pageContext?.pageData) {
    switch (ctx.pageContext.pathname) {
      case '/':
        return <Home />
      case '/blog':
        return <BlogList />
      default:
        if (ctx.pageContext.pathname.startsWith('/blog/')) {
          return <BlogPost />
        }
        return <Page />
    }
  } else return <NotFound />
}
