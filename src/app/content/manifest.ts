import { zapDirCache } from './markdown/get-dirs'
import { zapRedirectCache } from './redirects'
import { IS_DEV } from 'rwsdk/constants'
import { requestInfo } from 'rwsdk/worker'
import { env } from 'cloudflare:workers'

const manifestCacheKey = 'manifest:jldec/agents-chat'

let manifestMemo: null | string[] = null

// TODO: remove.
// This is of dubious value in prod, since there may be multiple workers in flight.
export function zapManifestCache() {
  manifestMemo = null
}

// Fetch array of rooted file paths from source
export async function getManifest(noCache: boolean = false) {
  let manifest: string[] = []
  let source = 'github'

  if (!noCache) {
    if (manifestMemo) return manifestMemo

    const cachedContent = await env.PAGEDATA_CACHE.get(manifestCacheKey)
    if (cachedContent !== null) {
      manifestMemo = JSON.parse(cachedContent) as string[]
      return manifestMemo
    }
  }

  // local dev uses content directory in worker site public assets manifest
  if (IS_DEV && !env.TEST_GH) {
    const origin = new URL(requestInfo.request.url).origin
    source = `${origin}/_content`
    const resp = await fetch(source)
    if (resp.ok) {
      // TODO: validate json
      manifest = (await resp.json()) as string[]
    }
  } else {
    // https://docs.github.com/en/rest/git/trees
    const url = `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/git/trees/${env.GH_BRANCH}:${env.GH_PATH}?recursive=1`
    console.log('getManifest', url)
    const resp = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${env.GH_PAT}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'agents-chat-worker'
      }
    })
    if (resp.ok) {
      const rawtree = ((await resp.json()) as { tree: { type: string, path: string }[] })?.tree
      // TODO: validate json
      for (const { type, path } of rawtree) {
        if (type === 'blob') {
          manifest.push('/' + path)
        }
      }
    }
  }

  if (manifest?.length) {
    manifestMemo = manifest
    requestInfo.cf.waitUntil(env.PAGEDATA_CACHE.put(manifestCacheKey, JSON.stringify(manifest)))
    // invalidate caches when manifest is reloaded
    zapDirCache()
    zapRedirectCache()
  } else {
    manifest = []
  }

  console.log('getManifest', source, manifest?.length, 'files')
  return manifest
}
