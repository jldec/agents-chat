import { requestInfo as r } from 'rwsdk/worker'
import { Layout } from './Layout'

// assumes r.ctx.pageContext is set
export function Page() {
  const pageData = r.ctx.pageContext?.pageData
  return (
    <Layout>
      <div dangerouslySetInnerHTML={{ __html: pageData?.html ?? '[empty page]' }} />
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
