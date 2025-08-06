import { cn } from '@/lib/utils'
import markdownit from 'markdown-it'
import type { Message } from './ChatStore'
import type { UIMessage } from 'ai'

const md = markdownit({
  linkify: true
})

function TextMessage({ message, role }: { message: string; role: Message['role'] }) {
  return (
    <div
      className={cn('border-gray-200 p-2 rounded-lg', role === 'assistant' ? 'bg-gray-100' : 'bg-white')}
      dangerouslySetInnerHTML={{ __html: md.render(message) }}
    />
  )
}

function JsonMessage({ message }: any) {
  return (
    <div className="text-sm border border-gray-300 rounded-2xl p-2 ml-10 whitespace-pre">
      {typeof message === 'object' ? JSON.stringify(message, null, 2) : message}
    </div>
  )
}

function MessageContent({ message, depth }: { message: Message | UIMessage; depth: number }) {
  if (!('parts' in message)) return TextMessage({ message: message.content, role: message.role })
  return message.parts.map((p, i) => {
    switch (p.type) {
      case 'text':
        return <TextMessage key={message.id + '-text-' + i} message={p.text} role={message.role} />
      case 'tool-invocation':
        if (
          p.toolInvocation.toolName === 'subagentNewMessage' &&
          'result' in p.toolInvocation &&
          p.toolInvocation.result.length > 0
        ) {
          return (
            <div key={message.id + '-subagent-' + i}>
              <JsonMessage message={p.toolInvocation.args.name} />
              <MessageList messages={p.toolInvocation.result} depth={depth + 1} />
            </div>
          )
        }
        return <JsonMessage key={message.id + '-tool-invocation-' + i} message={p.toolInvocation.toolName} />
      default:
        return null
    }
  })
}

// No hooks - component can run in both RSC and client
export function MessageList({ messages, depth = 0 }: { messages: Message[] | UIMessage[]; depth?: number }) {
  return (
    <div
      id="message-list"
      className={'flex flex-col gap-2 prose max-w-none prose-p:!my-0' + (depth > 0 ? ' ml-10 mb-6' : '')}
    >
      {messages.map((message, i) => (
        <MessageContent key={message.id} message={message} depth={depth} />
      ))}
    </div>
  )
}
