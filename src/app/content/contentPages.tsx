import type { RequestInfo } from 'rwsdk/worker'

export async function ContentPages(r: RequestInfo) {
  const url = new URL(r.request.url)
  const path = url.pathname
  const params = r.params.$0

  console.log(`contentHandler r.request.url ${r.request.url} r.params.$0 ${r.params.$0}`)

  return <div className="text-center p-2">Hello Content path "{path}", params "{params}"</div>

  // const newUrl = url.origin + '/_content' + url.pathname
  // return fetch(new Request(newUrl, r.request))
}

function requestToContent(r: RequestInfo) {
  const url = new URL(r.request.url)
  const path = url.pathname
  const params = r.params.$0

}