import type { UIMessage, UIDataTypes } from 'ai'
import { MessageListLayout } from '../components/MessageListLayout'
import { TextMessage } from '../components/TextMessage'
import { JsonMessage } from '../components/JsonMessage'
import { UITools } from './tools'

export type ToolsUIMessage = UIMessage<unknown, UIDataTypes, UITools>

function MessageContent({ message, depth }: { message: ToolsUIMessage; depth: number }) {
  if (!message.parts) return <JsonMessage message={message} />
  return message.parts?.map((p, i) => {
    if (p.type === 'step-start') return null
    if (p.type === 'text') return <TextMessage key={message.id + '-text-' + i} message={p.text} role={message.role} />
    // TODO: refine this not to dump everything for tool calls and subagent responses
    return <JsonMessage key={message.id + '-' + p.type + '-' + i} message={p} />
  })
}

// No hooks - component can run in both RSC and client
export function ToolsUIMessageList({ messages, depth = 0 }: { messages: ToolsUIMessage[]; depth?: number }) {
  return (
    <MessageListLayout depth={depth}>
      {messages.map((message, i) => (
        <MessageContent key={i} message={message} depth={depth} />
      ))}
    </MessageListLayout>
  )
}
