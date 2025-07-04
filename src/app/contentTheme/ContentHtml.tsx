import { requestInfo as r } from 'rwsdk/worker'

export function ContentHtml() {
  const pageData = r.ctx.pageContext?.pageData
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: pageData?.html ?? '[empty page]' }} />
}
