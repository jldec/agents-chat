import type { UIMessage } from 'ai'
import { MessageListLayout } from './MessageListLayout'
import { TextMessage } from './TextMessage'
import { JsonMessage } from './JsonMessage'

function MessageContent({ message, depth }: { message: UIMessage; depth: number }) {
  if (!message.parts) return <JsonMessage message={message} />
  return message.parts?.map((p, i) => {
    switch (p.type) {
      case 'text':
        return <TextMessage key={message.id + '-text-' + i} message={p.text} role={message.role} />
      // case 'tool-invocation':
      //   if (
      //     p.toolInvocation.toolName === 'subagentNewMessage' &&
      //     'result' in p.toolInvocation &&
      //     p.toolInvocation.result.length > 0
      //   ) {
      //     return (
      //       <div key={message.id + '-subagent-' + i}>
      //         <JsonMessage message={p.toolInvocation.args.name} />
      //         <MessageListUI messages={p.toolInvocation.result} depth={depth + 1} />
      //       </div>
      //     )
      //   }
      //   return <JsonMessage key={message.id + '-tool-invocation-' + i} message={p.toolInvocation.toolName} />
      default:
        return null
    }
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
