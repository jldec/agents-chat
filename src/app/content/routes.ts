import { getDirs, getPagePaths, zapDirCache } from './markdown/get-dirs'
import { getManifest, zapManifestCache } from './manifest'
import { getRedirects, zapRedirectCache } from './redirects'
import { env } from 'cloudflare:workers'
import { requestInfo } from 'rwsdk/worker'
import { route, prefix } from 'rwsdk/router'

export const contentRoutes = [
  route('/', async () => {
    return Response.json({ message: 'Hello, world!' })
  })
]
