import { requestInfo as r } from 'rwsdk/worker'
import { Layout } from './Layout'
import { List, SquareChevronUp, SquareChevronDown } from './icons'

function parentPath(path: string) {
  return path.split('/').slice(0, -1).join('/') || '/'
}

function formatDate(date: any) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  if (!date || !(date instanceof Date)) return ''
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long'
  }).format(date)
}

// assumes r.ctx.pageContext is set
export function BlogPost() {
  const pageData = r.ctx.pageContext.pageData
  const dirData = r.ctx.pageContext.dirData
  const longdate = [formatDate(pageData.attrs?.date)].filter(Boolean).join(' - ')

  return (
    <Layout>
      <title>{pageData.attrs.title}</title>
      <p className="flex">
        <span className="flex-grow">{longdate}</span>
        {/* <a
          className="px-[6px] text-gray-400 hover:text-orange-500"
          role="button"
          onClick={() => document.getElementById('chat-icon')?.click()}
        >
          Ask AI
        </a> */}
        {dirData?.next ? (
          <a className="px-[6px] text-gray-400 hover:text-orange-500" href={parentPath(pageData.path)}>
            <List className="h-5" />
          </a>
        ) : (
          ''
        )}
        {dirData?.prev ? (
          <a
            className="px-[6px] text-gray-400 hover:text-orange-500"
            href={dirData.prev.href}
            title={`Prev: ${dirData.prev.text}`}
          >
            <SquareChevronUp className="h-5" />
          </a>
        ) : (
          ''
        )}
        {dirData?.next ? (
          <a
            className="px-[6px] text-gray-400 hover:text-orange-500"
            href={dirData.next.href}
            title={`Next: ${dirData.next.text}`}
          >
            <SquareChevronDown className="h-5" />
          </a>
        ) : (
          ''
        )}
      </p>
      <div dangerouslySetInnerHTML={{ __html: pageData.html }} />
    </Layout>
  )
}
