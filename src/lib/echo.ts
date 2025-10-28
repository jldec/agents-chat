import type { RequestInfo } from 'rwsdk/worker'
import { env } from 'cloudflare:workers'

export async function echoHandler(requestInfo: RequestInfo) {
  // find chatstore DO colo location
  const now = Date.now()
  const id = env.CHATSTORE_DURABLE_OBJECT.idFromName(env.RWSDK_CHATSTORE)
  const stub = env.CHATSTORE_DURABLE_OBJECT.get(id)
  const resp = await stub.fetch('https://yolo/colo')
  const chatStore: unknown = resp.ok ? await resp.json() : { status: resp.status }
  // @ts-ignore
  chatStore.latency = Date.now() - now

  return Response.json({
    url: requestInfo.request.url,
    method: requestInfo.request.method,
    chatStore,
    headers: Object.fromEntries(requestInfo.request.headers),
    cf: requestInfo.request.cf
  })
}
