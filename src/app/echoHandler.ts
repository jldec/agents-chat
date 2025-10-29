import type { RequestInfo } from 'rwsdk/worker'
import { env } from 'cloudflare:workers'
import { getColo } from '@/lib/getColo'

export async function echoHandler(requestInfo: RequestInfo) {
  // find chatstore DO colo location
  const id = env.CHATSTORE_DURABLE_OBJECT.idFromName(env.RWSDK_CHATSTORE)
  const chatStore = env.CHATSTORE_DURABLE_OBJECT.get(id)
  const chatStoreColo = await chatStore.colo()

  const now = Date.now()
  chatStoreColo.ping = await chatStore.ping()
  chatStoreColo.pingTime = Date.now() - now

  return Response.json({
    url: requestInfo.request.url,
    method: requestInfo.request.method,
    workerColo: await getColo(),
    chatStoreColo: chatStoreColo,
    headers: Object.fromEntries(requestInfo.request.headers),
    cf: requestInfo.request.cf
  })
}
