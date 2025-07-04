import { cn } from '@/lib/utils'
import markdownit from 'markdown-it'
import type { Message } from './ChatStore'
import type { UIMessage } from 'ai'

const md = markdownit({
  linkify: true
})

function messageContent(message: Message | UIMessage): string {
  return 'parts' in message
    ? (message.parts?.map((p) => (p.type === 'text' ? p.text : JSON.stringify(p, null, 2))).join('\n\n') ?? '')
    : message.content
}

// No hooks - component can run in both RSC and client
export function MessageList({ messages }: { messages: Message[] | UIMessage[] }) {
  return (
    <div id="message-list" className="flex flex-col gap-2">
      {messages.map((m) => (
        <div
          className={cn('border-gray-200 p-2 prose prose-p:my-2', m.role === 'assistant' ? 'bg-gray-100' : 'bg-white')}
          key={m.id}
          dangerouslySetInnerHTML={{ __html: md.render(messageContent(m)) }}
        />
      ))}
    </div>
  )
}
