import { requestInfo as r } from 'rwsdk/worker'
import { ContentLayout } from './ContentLayout'

export function NotFound() {
  return (
    <ContentLayout>
      <div className="prose max-w-none">
        <h1>404</h1>
        <p>Page not found</p>
        <p>{r.request.url}</p>
      </div>
    </ContentLayout>
  )
}
