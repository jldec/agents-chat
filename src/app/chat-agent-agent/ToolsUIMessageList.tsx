import type { UIMessage, UIDataTypes, ToolUIPart } from 'ai'
import { MessageListLayout } from '../components/MessageListLayout'
import { TextMessage } from '../components/TextMessage'
import { JsonMessage } from '../components/JsonMessage'
import { UITools } from './tools'

export type ToolsUIMessage = UIMessage<unknown, UIDataTypes, UITools>

function MessageContent({ message, depth }: { message: ToolsUIMessage; depth: number }) {
  if (!message.parts) return <JsonMessage message={message} />
  return message.parts?.map((part, i) => {
    switch (part.type) {
      case 'step-start':
        return null
      case 'text':
        return <TextMessage key={i} message={part.text} role={message.role} />
      case 'tool-getAgentTime':
      case 'tool-subagentGetMessages':
      case 'tool-subagentNewMessage':
      case 'tool-subagentClearMessages':
      case 'tool-addMCPServerUrl':
      case 'tool-removeMCPServerUrl':
      case 'tool-listMCPServers':
        return <RenderToolUIPart key={i} part={part} />
      default:
        return <JsonMessage key={i} message={part} prefix={part.type} />
    }
  })
}

function RenderToolUIPart({ part }: { part: ToolUIPart<UITools> }) {
  return (
    <div className="text-sm border border-gray-300 rounded-2xl p-2 ml-10">
      <div className="italic pb-1">{part.type.slice(5)} {JSON.stringify(part.input)}</div>
      {[part].map((part) => {
        switch (part.state) {
          case 'input-available':
          case 'input-streaming':
            return <div key={1}>Loading...</div>
          case 'output-available':
            return (
              <div key={1} className="whitespace-pre-wrap">
                {/* @ts-ignore */}
                {typeof part.output === 'string' ? part.output : JSON.stringify(part.output)}
              </div>
            )
          case 'output-error':
            return <div key={1}>{part.errorText}</div>
        }
      })}
    </div>
  )
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
