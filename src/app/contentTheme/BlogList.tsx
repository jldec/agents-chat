import { requestInfo as r } from 'rwsdk/worker'
import { ContentLayout } from './ContentLayout'
import { ContentHtml } from './ContentHtml'

export function BlogList() {
  const pageData = r.ctx.pageContext?.pageData
  return (
    <ContentLayout>
      <ContentHtml />
      {pageData?.dir ? (
        <div className="prose max-w-none mt-4">
          <ul>
            {pageData.dir.map((d) => {
              const text = d.attrs?.title ?? d.path
              const date = d.attrs?.date ?? ''
              return (
                <li key={d.path} className="leading-[1.1rem] pb-1">
                  <a
                    className="group flex items-end gap-4 no-underline border-b-[1.5px] border-b-transparent hover:border-b-current"
                    href={d.path}
                  >
                    <span className="flex-grow">{text}</span>
                    <span className="hidden sm:block text-transparent group-hover:text-orange-500">{date}</span>
                  </a>
                </li>
              )
            })}
          </ul>{' '}
        </div>
      ) : null}
    </ContentLayout>
  )
}
