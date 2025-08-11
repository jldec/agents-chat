import { requestInfo } from 'rwsdk/worker'
import { NotFound } from './404'
import { Page } from './Page'
import { Home } from './Home'

export async function contentTheme() {
  const pathname = requestInfo.ctx.pageContext?.pathname
  if (pathname) {
    switch (pathname) {
      case '/':
        return <Home />
      default:
        return <Page />
    }
  } else {
    requestInfo.response.status = 404
    return <NotFound />
  }
}
