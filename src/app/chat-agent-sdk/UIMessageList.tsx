import type { UIMessage } from 'ai'
import { MessageListLayout } from '../components/MessageListLayout'
import { TextMessage } from '../components/TextMessage'
import { JsonMessage } from '../components/JsonMessage'

export function UIMessageList({ messages }: { messages: UIMessage[] }) {
  return (
    <MessageListLayout>
      {messages.map((message, i) => {
        if (!message.parts) return <JsonMessage key={message.id} message={message} />
        return message.parts?.map((p, i) => {
          if (p.type === 'step-start') return null
          if (p.type === 'text')
            return <TextMessage key={message.id + '-text-' + i} message={p.text} role={message.role} />
          return <JsonMessage key={message.id + '-' + p.type + '-' + i} message={p} />
        })
      })}
    </MessageListLayout>
  )
}
