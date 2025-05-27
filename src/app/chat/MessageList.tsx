import { cn } from '@/lib/utils'
import { getMessages } from './functions'

export async function MessageList() {
  const messages = await getMessages()
  return (
    <div className="flex flex-col gap-2">
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
