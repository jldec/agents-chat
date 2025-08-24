import type { AgentInputItem } from '@openai/agents'
import { MessageListLayout } from './MessageListLayout'
import { TextMessage } from './TextMessage'
import { JsonMessage } from './JsonMessage'

// No hooks - component can run in both RSC and client
export function MessageListOpenAI({ messages }: { messages: AgentInputItem[] }) {
  return (
    <MessageListLayout>
      {messages.map((message, i) => (
        <JsonMessage key={i} message={message} />
      ))}
    </MessageListLayout>
  )
}
