import { type RequestInfo, renderToStream } from 'rwsdk/worker'
import { Document } from '@/app/Document'
import { NotFound } from './404'
import { Page } from './Page'
import { Home } from './Home'
import { BlogList } from './BlogList'
import { BlogPost } from './BlogPost'

export async function contentTheme({ ctx, request }: RequestInfo) {
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
  } else {
    // TODO: replace with requestInfo.status = 404 when available
    // https://github.com/redwoodjs/sdk/issues/568
    console.log(`404: ${request.url}`)
    return new Response(await renderToStream(<NotFound />, { Document }), {
      status: 404
    })
  }
}
