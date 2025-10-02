import { contentType } from 'mime-types'
import { extname } from 'node:path'
import { env } from 'cloudflare:workers'
import { requestInfo } from 'rwsdk/worker'
import { IS_DEV } from '@/lib/isdev'

export async function getStatic(path: string, noCache: boolean = false): Promise<Response | null> {
  if (!noCache) {
    const { value, metadata } = await env.STATIC_CACHE.getWithMetadata(path, {
      type: 'stream',
      // https://developers.cloudflare.com/kv/api/read-key-value-pairs/#cachettl-parameter
      cacheTtl: 86400
    })
    if (value !== null) return new Response(value, { headers: (metadata as any)?.headers })
  }
  let resp: Response
  let source = 'github'
  if (IS_DEV && !env.GH_TEST) {
    const origin = new URL(requestInfo.request.url).origin
    source = `${origin}/_content`
    resp = await fetch(`${source}${path}`)
  } else {
    // https://docs.github.com/en/rest/repos/contents
    resp = await fetch(
      `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${env.GH_PATH}${path}?ref=${env.GH_BRANCH}`,
      {
        headers: {
          Accept: 'application/vnd.github.raw+json',
          Authorization: `Bearer ${env.GH_PAT}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'agents-chat-worker'
        }
      }
    )
  }
  if (!resp.ok || !resp.body) return null

  const [body, body2] = resp.body.tee()
  const headers = copyHeaders(resp.headers)
  const type = contentType(extname(path))
  if (type) {
    headers['content-type'] = type
  }
  headers['cache-control'] = 'public, max-age=86400'
  requestInfo.cf.waitUntil(env.STATIC_CACHE.put(path, body2, { metadata: { headers } }))
  console.log('getStatic', source, path, type, resp.headers.get('content-length'), 'bytes')
  return new Response(body, { headers })
}

function copyHeaders(ogHeaders: Headers) {
  const copyList = ['content-type', 'content-language', 'content-encoding', 'content-disposition', 'etag']
  const headers: Record<string, string> = {}
  copyList.forEach((header) => {
    if (ogHeaders.has(header)) {
      headers[header] = ogHeaders.get(header)!
    }
  })
  return headers
}
