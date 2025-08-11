import { requestInfo as r } from 'rwsdk/worker'
import { ContentLayout } from './ContentLayout'

export function NotFound() {
  const url = new URL(r.request.url)
  return (
    <ContentLayout>
      <div className="prose max-w-none mt-8 text-center">
        <h1>404</h1>
        <p>Page not found</p>
        <p>{url.origin + url.pathname}</p>
      </div>
    </ContentLayout>
  )
}
