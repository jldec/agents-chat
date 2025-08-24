import { getDirs, getPagePaths, zapDirCache } from './markdown/get-dirs'
import { getManifest, zapManifestCache } from './manifest'
import { getRedirects, zapRedirectCache } from './redirects'
import { env } from 'cloudflare:workers'
import { requestInfo } from 'rwsdk/worker'
import { route, prefix } from 'rwsdk/router'

export const contentApiRoutes = prefix('/api', [
  route('/pagedata-cache', async () => {
    if (requestInfo.request.method === 'GET') {
      return Response.json(await env.PAGEDATA_CACHE.list())
    } else if (requestInfo.request.method === 'DELETE') {
      const list = await env.PAGEDATA_CACHE.list()
      const keys = list.keys.map((o) => o.name)
      const deleted = await Promise.all(keys.map((key) => env.PAGEDATA_CACHE.delete(key)))
      zapDirCache()
      return Response.json({ pageCache: deleted, caches: 'zapped' })
    } else return Response.json({ error: 'unsupported method' }, { status: 405 })
  }),

  route('/static-cache', async () => {
    if (requestInfo.request.method === 'GET') {
      return Response.json(await env.STATIC_CACHE.list())
    } else if (requestInfo.request.method === 'DELETE') {
      const list = await env.STATIC_CACHE.list()
      const keys = list.keys.map((o) => o.name)
      const deleted = await Promise.all(keys.map((key) => env.STATIC_CACHE.delete(key)))
      zapManifestCache()
      zapRedirectCache()
      return Response.json({ pageCache: deleted, caches: 'zapped' })
    } else return Response.json({ error: 'unsupported method' }, { status: 405 })
  }),

  route('/manifest', async () => {
    if (requestInfo.request.method === 'GET') {
      return Response.json(await getManifest())
    } else return Response.json({ error: 'unsupported method' }, { status: 405 })
  }),

  route('/redirects', async () => {
    if (requestInfo.request.method === 'GET') {
      return Response.json(await getRedirects())
    } else return Response.json({ error: 'unsupported method' }, { status: 405 })
  }),

  route('/dirs', async () => {
    if (requestInfo.request.method === 'GET') {
      return Response.json(await getDirs())
    } else return Response.json({ error: 'unsupported method' }, { status: 405 })
  }),

  route('/pagepaths', async () => {
    if (requestInfo.request.method === 'GET') {
      return Response.json(await getPagePaths())
    } else return Response.json({ error: 'unsupported method' }, { status: 405 })
  })
])
