import type { RequestInfo } from 'rwsdk/worker'
import { env } from 'cloudflare:workers'

export async function echoHandler(requestInfo: RequestInfo) {
  // find chatstore DO colo location
  const id = env.CHATSTORE_DURABLE_OBJECT.idFromName(env.RWSDK_CHATSTORE)
  const chatStore = env.CHATSTORE_DURABLE_OBJECT.get(id)
  const colo = await chatStore.getColo()

  const now = Date.now()
  await chatStore.ping()
  colo.doPingTime = Date.now() - now

  return Response.json({
    url: requestInfo.request.url,
    method: requestInfo.request.method,
    chatStore: colo,
    headers: Object.fromEntries(requestInfo.request.headers),
    cf: requestInfo.request.cf
  })
}
