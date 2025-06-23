// wrapper for worker fetch to cache routes
// TODO: remove console.logs
export function cacheRoutes(
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>,
  options: { exclude?: RegExp } = {}
) {
  return async (request: Request, env: Env, ctx: ExecutionContext) => {
    const url = new URL(request.url)
    let cache: Cache | undefined

    try {
      // check cache or clear cache when pragma: no-cache
      if (
        request.method === 'GET' &&
        !url.search && // avoid caching for any url with params e.g. &__rsc=true
        !options.exclude?.test(url.pathname)
      ) {
        cache = await caches.open('default')
        if (request.headers.get('pragma')?.includes('no-cache')) {
          try {
            // this exposes cache clearing to the client - not ideal but practical
            ctx.waitUntil(cache.delete(request))
            console.log(`cache delete ${url.pathname}`)
          } catch (error: any) {
            console.error(`cache delete error ${url.pathname}`, error)
          }
        } else {
          const cachedResponse = await cache.match(request)
          if (cachedResponse) {
            console.log(`cache hit ${url.pathname}`)
            return cachedResponse
          } else {
            console.log(`cache miss ${url.pathname}${url.search}`)
          }
        }
      }

      // possibly expensive render
      let response = await fetch(request, env, ctx)

      // cache only matching routes with cache-control: public
      if (cache && response.status === 200 && response.headers.get('cache-control')?.includes('public')) {
        try {
          ctx.waitUntil(cache.put(request, response.clone()))
          console.log(`cache set ${url.pathname}`)
        } catch (error: any) {
          console.error(`cache set error ${url.pathname}`, error)
        }
      }
      return response
    } catch (error: any) {
      console.error(error)
      return new Response(`worker fetch: ${error.stack || error.message || 'internal error'}`, { status: 500 })
    }
  }
}
