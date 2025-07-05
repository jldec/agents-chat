import { requestInfo as r } from 'rwsdk/worker'
import { ContentLayout } from './ContentLayout'

export function NotFound() {
  return (
    <ContentLayout>
      <h1>404</h1>
      <p>Page not found</p>
      <p>{r.request.url}</p>
    </ContentLayout>
  )
}
