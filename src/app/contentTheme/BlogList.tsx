import { requestInfo as r } from 'rwsdk/worker'
import { Layout } from './Layout'

export function BlogList() {
  const pageData = r.ctx.pageContext?.pageData
  return (
    <Layout>
      <title>{pageData?.attrs.title}</title>
      <div dangerouslySetInnerHTML={{ __html: pageData?.html ?? '[empty page]' }} />
      {pageData?.dir ? (
        <ul>
          {pageData.dir.map((d) => {
            const text = d.attrs?.title ?? d.path
            const date = d.attrs?.date ?? ''
            return (
              <li key={d.path} className="leading-[1.1rem] pb-1">
                <a
                  className="group flex items-end gap-4 no-underline hover:transform-none border-b-[1.5px] border-b-transparent hover:border-b-current"
                  href={d.path}
                >
                  <span className="flex-grow">{text}</span>
                  <span className="hidden sm:block text-transparent group-hover:text-orange-500">{date}</span>
                </a>
              </li>
            )
          })}
        </ul>
      ) : null}
    </Layout>
  )
}
