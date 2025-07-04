import type { RequestInfo } from 'rwsdk/worker'

export async function echoHandler(requestInfo: RequestInfo) {
  return Response.json({
    url: requestInfo.request.url,
    method: requestInfo.request.method,
    headers: Object.fromEntries(requestInfo.request.headers),
    body: await requestInfo.request.text()
  })
}
