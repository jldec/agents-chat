import { requestInfo as r } from 'rwsdk/worker'
import { Layout } from './Layout'

export function Home() {
  const pageData = r.ctx.pageContext?.pageData
  return (
    <Layout>
      <div dangerouslySetInnerHTML={{ __html: pageData?.html ?? '[empty page]' }} />
    </Layout>
  )
}
