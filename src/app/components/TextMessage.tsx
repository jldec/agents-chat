import markdownit from 'markdown-it'

const md = markdownit({
  linkify: true
})

export function TextMessage({ message, role }: { message: string; role: string }) {
  return (
    <div
      className={`border-gray-200 p-2 rounded-lg ${role === 'assistant' ? 'bg-gray-100' : 'bg-white'}`}
      dangerouslySetInnerHTML={{ __html: md.render(message) }}
    />
  )
}
