import { requestInfo as r } from 'rwsdk/worker'
import { ContentLayout } from './ContentLayout'

// h1 #id is set to 404 to signal client.tsx not to run initClient
// See https://github.com/redwoodjs/sdk/issues/568#issuecomment-3038822673
export function NotFound() {
  return (
    <ContentLayout>
      <div className="prose max-w-none">
        <h1 id="404">404</h1>
        <p>Page not found</p>
        <p>{r.request.url}</p>
      </div>
    </ContentLayout>
  )
}
