import { requestInfo } from 'rwsdk/worker'
import { NotFound } from './NotFound'
import { Page } from './Page'
import { Home } from './Home'

export async function contentTheme() {
  const request = requestInfo.request
  const pageContext = requestInfo.ctx.pageContext
  if (pageContext?.pageData) {
    switch (pageContext.pathname) {
      case '/':
        return <Home />
      default:
        return <Page />
    }
  } else {
    const message = `404 not found: ${request.method} ${request.url}`
    console.log(message)
    if (request.method === 'GET') {
      requestInfo.response.status = 404
      return <NotFound />
    } else {
      return new Response(message, { status: 404 })
    }
  }
}
