import { requestInfo as r } from 'rwsdk/worker'
import { Layout } from './Layout'

export function NotFound() {
  return (
    <Layout>
      <h1>404</h1>
      <p>Page not found</p>
      <p>{r.request.url}</p>
    </Layout>
  )
}
