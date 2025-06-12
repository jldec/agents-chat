import { env } from 'cloudflare:workers'
import { route } from 'rwsdk/router'
import { getWsServerDurableObjectFetch } from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'

export const tinybaseApiRoutes = [
  route(env.TINYBASE_SYNC_ROUTE, async ({ request }) => {
    // @ts-expect-error (persister type on class doesn't match)
    return await getWsServerDurableObjectFetch('TINYBASE_DURABLE_OBJECT')(request, env)
  })
]
