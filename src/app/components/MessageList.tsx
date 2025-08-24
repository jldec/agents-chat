import { cn } from '@/lib/utils'
import markdownit from 'markdown-it'
import type { Message } from '@/lib/types'
import type { UIMessage } from 'ai'
import { AgentInputItem } from '@openai/agents'

const md = markdownit({
  linkify: true
})

type Msg = Message | AgentInputItem | UIMessage

function TextMessage({ message, role }: { message: string; role: string }) {
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

function MessageContent({ message, depth }: { message: Msg; depth: number }) {
  if (!('parts' in message)) {
    if ('content' in message) {
      if (typeof message.content === 'string') {
        // @ts-ignore (TypeScript needs to die)
        return TextMessage({ message: message.content, role: message.role ?? '' })
      } else if (Array.isArray(message.content)) {
        // @ts-ignore
        return TextMessage({ message: message.content.map((c) => c.text ?? '').join('\n\n'), role: message.role ?? '' })
      } else {
        // @ts-ignore
        return TextMessage({ message: JSON.stringify(message, null, 2), role: message.role ?? '' })
      }
    }
  }
  if ('parts' in message) {
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
}

// No hooks - component can run in both RSC and client
export function MessageList({ messages, depth = 0 }: { messages: Msg[]; depth?: number }) {
  return (
    <div
      id="message-list"
      className={'flex flex-col gap-2 prose max-w-none prose-p:!my-0' + (depth > 0 ? ' ml-10 mb-6' : '')}
    >
      {messages.map((message, i) => (
        <MessageContent key={i} message={message} depth={depth} />
      ))}
    </div>
  )
}
