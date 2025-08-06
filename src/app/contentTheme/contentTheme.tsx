import { requestInfo } from 'rwsdk/worker'
import { NotFound } from './404'
import { Page } from './Page'
import { Home } from './Home'
import { BlogList } from './BlogList'
import { BlogPost } from './BlogPost'

export async function ContentTheme() {
  const pageData = requestInfo.ctx.pageContext?.pageData
  const pathname = requestInfo.ctx.pageContext?.pathname
  if (pageData) {
    switch (pathname) {
      case '/':
        return <Home />
      case '/blog':
        return <BlogList />
      default:
        if (pathname?.startsWith('/blog/')) {
          return <BlogPost />
        }
        return <Page />
    }
  } else {
    requestInfo.response.status = 404
    return <NotFound />
  }
}
