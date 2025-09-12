import type { AgentInputItem } from '@openai/agents'
import { MessageListLayout } from '../components/MessageListLayout'
import { TextMessage } from '../components/TextMessage'
import { JsonMessage } from '../components/JsonMessage'

// No hooks - component can run in both RSC and client
export function MessageListOpenAI({ messages }: { messages: AgentInputItem[] }) {
  return (
    <MessageListLayout>
      {messages.map((message, i) => {
        if (message.type !== 'message') {
          return <JsonMessage key={i} message={message} />
        }
        if (typeof message.content === 'string') {
          return <TextMessage key={i} message={message.content} role={message.role} />
        }
        return message.content.map((content, j) => {
          if ('text' in content) {
            return <TextMessage key={`${i}-${j}`} message={content.text || ''} role={message.role} />
          }
          return <JsonMessage key={`${i}-${j}`} message={content} />
        })
      })}
    </MessageListLayout>
  )
}
