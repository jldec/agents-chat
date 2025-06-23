// wrapper for worker fetch to cache specific routes
export function cacheRoutes(
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>,
  routes: String[]
) {
  return async (request: Request, env: Env, ctx: ExecutionContext) => {
    const url = new URL(request.url)
    let cache: Cache | undefined = undefined

    try {
      // check cache on specific routes, GET only (no search params - stops caching when __rsc=true)
      if (routes.includes(url.pathname) && !url.search && request.method === 'GET') {
        cache = await caches.open('default')
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          console.log(
            `cache hit ${url.pathname + url.search} ${JSON.stringify(Object.fromEntries(request.headers), null, 2)}`
          )
          return cachedResponse
        }
      }
      // perform expensive render
      let response = await fetch(request, env, ctx)
      // set cache if we checked it earlier and if response is ok
      if (cache && response.status === 200) {
        response = new Response(response.body, response)
        response.headers.append('Cache-Control', 's-maxage=3600')
        console.log('cache set', url.pathname)
        ctx.waitUntil(cache.put(request, response.clone()))
      }
      return response
    } catch (error: any) {
      console.error(error)
      return new Response(`worker fetch: ${error.stack || error.message || 'internal error'}`, { status: 500 })
    }
  }
}
