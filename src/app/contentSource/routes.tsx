import { getPagePaths } from './markdown/get-dirs'
import { getManifest } from './manifest'
import { getPageData } from './markdown/get-markdown'
import { getStatic } from './static'
import { getRedirects } from './redirects'
import { type RequestInfo } from 'rwsdk/worker'

export const contentRoutes = async ({ request, ctx }: RequestInfo): Promise<Response | void> => {
  const noCache =
    request.headers.get('cache-control')?.includes('no-cache') || request.headers.get('pragma')?.includes('no-cache')
  const url = new URL(request.url)
  const pathname = url.pathname
  const search = url.search

  // redirect trailing slashes
  // TODO: should be configurable
  if (pathname.endsWith('/') && pathname.length > 1) {
    return Response.redirect(url.origin + pathname.slice(0, -1) + search, 301)
  }

  // serve static content from manifest
  // only bypass manifest cache when reloading the home page
  const isHome = pathname === '/'
  const manifest = await getManifest(noCache && isHome)
  if (manifest.includes(pathname)) {
    const resp = await getStatic(pathname, noCache)
    if (resp) {
      console.log('static', pathname)
      return resp
    }
  }

  // return markdown pages in ctx.pageContext or return JSON if ?json
  const pagePaths = await getPagePaths()
  if (pathname in pagePaths) {
    const pageData = await getPageData(pathname, noCache)
    if (pageData) {
      // site is used for meta headers, dirEntry is only used for "next" links on blog pages
      const siteData = (await getPageData('/'))?.attrs
      const dirData = pathname.startsWith('/blog/')
        ? (await getPageData('/blog'))?.dir?.find((p) => p.path === pathname)
        : undefined

      if (url.searchParams.has('json')) return Response.json({ pageData, siteData, dirData })
      ctx.pageContext = { pathname, pageData, siteData, dirData }
      return
    }
  }

  // serve redirects
  const redirects = await getRedirects()
  if (pathname in redirects) {
    return Response.redirect(url.origin + redirects[pathname].redirect + search, redirects[pathname].status)
  }
}
