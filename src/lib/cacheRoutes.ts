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
          // this exposes cache clearing to the client - not ideal but practical
          await cache.delete(request)
          console.log(`cache delete ${url.pathname} ${JSON.stringify(Object.fromEntries(request.headers), null, 2)}`)
        } else {
          const cachedResponse = await cache.match(request)
          if (cachedResponse) {
            console.log(`cache hit ${url.pathname} ${JSON.stringify(Object.fromEntries(request.headers), null, 2)}`)
            return cachedResponse
          } else {
            console.log(
              `cache miss ${url.pathname}${url.search} ${JSON.stringify(Object.fromEntries(request.headers), null, 2)}`
            )
          }
        }
      }

      // possibly expensive render
      let response = await fetch(request, env, ctx)

      // cache only matching routes with cache-control: public
      if (
        cache &&
        response.status === 200 &&
        response.headers.get('cache-control')?.includes('public')
      ) {
        try {
          ctx.waitUntil(cache.put(request, response.clone()))
          console.log(`cache set ${url.pathname} ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`)
        } catch (error: any) {
          console.error(
            `cache set error, returning response anyway ${url.pathname} ${JSON.stringify(
              Object.fromEntries(response.headers),
              null,
              2
            )}`,
            error
          )
        }
      }
      return response
    } catch (error: any) {
      console.error(error)
      return new Response(`worker fetch: ${error.stack || error.message || 'internal error'}`, { status: 500 })
    }
  }
}
