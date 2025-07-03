import { requestInfo as r } from 'rwsdk/worker'

export function Layout({ children }: { children: React.ReactNode }) {
  const navlinks = r.ctx.pageContext.siteData?.navlinks
  return (
    <div className="prose max-w-2xl m-auto p-3 prose-img:mt-0 prose-p:mt-0 prose-a:text-blue-700 prose-a:whitespace-nowrap prose-hr:my-4">
      <nav>
        {navlinks?.map((link) => (
          <a href={link.href}>{link.text}</a>
        ))}
      </nav>
      {children}
    </div>
  )
}
