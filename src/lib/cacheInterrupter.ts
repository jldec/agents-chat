import { requestInfo, type RequestInfo } from 'rwsdk/worker'

/**
 * Cloudflare Workers Cache API interrupter
 * GET requests without query params are considered for caching
 * defaults to cache-control: public, max-age=3600 (1 hour)
 * Handlers can override cache settings by setting cache-control header
 * Works in conjunction with cacheResponse using a header to trigger response caching
 *
 * @todo Remove console.logs.
 */
export async function cacheInterrupter({ request, cf, headers }: RequestInfo): Promise<Response | void> {
  const url = new URL(request.url)

  if (
    request.method === 'GET' &&
    !url.search // avoid caching for urls with params e.g. ?__rsc=true
  ) {
    // @ts-ignore
    const cache = caches.default
    if (
      request.headers.get('pragma')?.includes('no-cache') ||
      request.headers.get('cache-control')?.includes('no-cache')
    ) {
      try {
        // this exposes cache clearing to the client - not ideal but practical
        cf.waitUntil(cache.delete(request))
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
    // signal cacheResponse to do its thing (tried but can't use requestInfo.ctx for this)
    headers.set('x-cache-interrupter', 'true')
  }
}

export function cacheResponse(fetch: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>) {
  return async (request: Request, env: Env, ctx: ExecutionContext) => {
    const pathname = new URL(request.url).pathname
    try {
      const response = await fetch(request, env, ctx)
      const cacheControl = response.headers.get('cache-control')

      const cacheInterrupter = response.headers.get('x-cache-interrupter')
      response.headers.delete('x-cache-interrupter') // don't cache or return this header

      // respect no-store and private
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control#directives
      if (
        cacheInterrupter &&
        response.status === 200 &&
        !cacheControl?.includes('no-store') &&
        !cacheControl?.includes('private')
      ) {
        try {
          const cacheResponse = response.clone()
          if (!cacheControl) {
            cacheResponse.headers.set('cache-control', 'public, max-age=3600')
          }
          // @ts-ignore
          const cache = caches.default
          ctx.waitUntil(cache.put(request, cacheResponse))
          console.log(`cache set ${pathname}`)
        } catch (error: any) {
          console.error(`cache set error ${pathname}`, error)
        }
      }
      return response
    } catch (error: any) {
      console.error(`worker cacheResponse error fetching ${pathname}`, error)
      return new Response(
        `worker cacheResponse error fetching ${pathname}: ${error.stack || error.message || 'internal error'}`,
        { status: 500 }
      )
    }
  }
}
