import { requestInfo } from 'rwsdk/worker'
import { NotFound } from './NotFound'
import { Page } from './Page'
import { Home } from './Home'

export async function contentTheme() {
  const pageContext = requestInfo.ctx.pageContext
  if (pageContext?.pageData) {
    switch (pageContext.pathname) {
      case '/':
        return <Home />
      default:
        return <Page />
    }
  } else {
    console.log('NotFound', pageContext?.pathname)
    requestInfo.response.status = 404
    return <NotFound />
  }
}
