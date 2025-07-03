import { requestInfo as r } from 'rwsdk/worker'
import { Layout } from './Layout'
import { Page } from './Page'

// assumes r.ctx.pageContext is set
export function BlogList() {
  return <Page />
}
