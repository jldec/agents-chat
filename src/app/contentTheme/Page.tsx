import { requestInfo as r } from 'rwsdk/worker'
import { Layout } from './Layout'
import { ContentHtml } from './ContentHtml'

export function Page() {
  const pageData = r.ctx.pageContext?.pageData
  return (
    <Layout>
      <ContentHtml />
      {pageData?.dir ? (
        <ul>
          {pageData.dir.map((d) => (
            <li key={d.path}>
              <a href={d.path}>{d.attrs?.title ?? d.path}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </Layout>
  )
}
