import { cn } from '@/lib/utils'
import type { Message } from './ChatStore'

// No hooks - component can run in both RSC and client
export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div id="message-list" className="flex flex-col gap-2">
      {messages.map((message) => (
        <div
          className={cn(
            'whitespace-pre-wrap border border-gray-200 p-2',
            message.role === 'assistant' ? 'bg-gray-100' : 'bg-white'
          )}
          key={message.id}
        >
          {message.content}
        </div>
      ))}
    </div>
  )
}
