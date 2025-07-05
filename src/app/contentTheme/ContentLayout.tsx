import { requestInfo as r } from 'rwsdk/worker'
import { Menu } from './Menu'
import { Splash } from './Splash'

export function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl m-auto py-2 md:px-2">
      <title>{r.ctx.pageContext?.pageData?.attrs.title || r.ctx.pageContext?.siteData?.title || 'jldec.me'}</title>
      <Menu />
      <Splash />
      {children}
    </div>
  )
}
