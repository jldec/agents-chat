import { cn } from '@/lib/utils'
import { getMessages } from './functions'

export async function MessageList() {
  const messages = await getMessages()
  return (
    <div id="message-list" className="flex flex-col gap-2 max-w-2xl">
      {messages.map((message) => (
        <div
          className={cn('whitespace-pre-wrap border border-gray-200 p-2', message.role === 'assistant' ? 'bg-gray-100' : 'bg-white')}
          key={message.id}
        >
          {message.content}
        </div>
      ))}
    </div>
  )
}
