import { cn } from '@/lib/utils'
import type { Message } from './ChatStore'
import markdownit from 'markdown-it'

const md = markdownit({
  linkify: true
})

// No hooks - component can run in both RSC and client
export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div id="message-list" className="flex flex-col gap-2">
      {messages.map((message) => (
        <div
          className={cn(
            'border-gray-200 p-2 prose prose-p:my-2',
            message.role === 'assistant' ? 'bg-gray-100' : 'bg-white'
          )}
          key={message.id}
        >
          {message.role === 'assistant' ? (
            <div dangerouslySetInnerHTML={{ __html: md.render(message.content) }}></div>
          ) : (
            message.content
          )}
        </div>
      ))}
    </div>
  )
}
