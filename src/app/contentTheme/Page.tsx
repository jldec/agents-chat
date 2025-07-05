import { requestInfo as r } from 'rwsdk/worker'
import { ContentLayout } from './ContentLayout'
import { ContentHtml } from './ContentHtml'

export function Page() {
  const pageData = r.ctx.pageContext?.pageData
  return (
    <ContentLayout>
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
    </ContentLayout>
  )
}
