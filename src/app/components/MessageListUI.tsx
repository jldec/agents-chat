import type { UIMessage } from 'ai'
import { MessageListLayout } from './MessageListLayout'
import { TextMessage } from './TextMessage'
import { JsonMessage } from './JsonMessage'

function MessageContent({ message, depth }: { message: UIMessage; depth: number }) {
  if (!message.parts) return <JsonMessage message={message} />
  return message.parts?.map((p, i) => {
    if (p.type === 'step-start') return null
    if (p.type === 'text') return (
      <>
        <TextMessage key={message.id + '-text-' + i} message={p.text} role={message.role} />
        <JsonMessage key={message.id + '-text-json-' + i} message={message} />
      </>
    )
    // TODO: refine this not to dump everything for tool calls and subagent responses
    return <JsonMessage key={message.id + '-' + p.type + '-' + i} message={p} />
  })
}

// No hooks - component can run in both RSC and client
export function MessageListUI({ messages, depth = 0 }: { messages: UIMessage[]; depth?: number }) {
  return (
    <MessageListLayout depth={depth}>
      {messages.map((message, i) => (
        <MessageContent key={i} message={message} depth={depth} />
      ))}
    </MessageListLayout>
  )
}
