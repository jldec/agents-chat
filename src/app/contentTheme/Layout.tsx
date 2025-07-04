import { requestInfo as r } from 'rwsdk/worker'
import { Menu } from './Menu'
import { Splash } from './Splash'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose max-w-3xl m-auto p-3">
      <title>{'Jürgen Leschner - ' + r.ctx.pageContext?.pageData?.attrs.title || 'jldec.me'}</title>
      <Menu />
      <Splash />
      {children}
    </div>
  )
}
