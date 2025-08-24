import type { Message } from '@/lib/types'
import { MessageListLayout } from './MessageListLayout'
import { TextMessage } from './TextMessage'

// No hooks - component can run in both RSC and client
export function MessageList({ messages, depth = 0 }: { messages: Message[]; depth?: number }) {
  return (
    <MessageListLayout depth={depth}>
      {messages.map((message, i) => (
        <TextMessage key={i} message={message.content} role={message.role} />
      ))}
    </MessageListLayout>
  )
}
