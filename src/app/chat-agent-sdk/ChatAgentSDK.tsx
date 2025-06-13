'use client'
import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'

import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'
import type { Message } from '@ai-sdk/react'
import type { UIMessage } from 'ai'

export function ChatAgentSDK() {
  const agent = useAgent({
    agent: 'chat-agent-sdk-durable-object', // kebab-cased binding name
    name: 'rwsdk-chat-agent-sdk'
  })

  const { messages, input, handleInputChange, handleSubmit, clearHistory } = useAgentChat({
    agent,
    maxSteps: 5,
    // context(justinvdm): Avoid fetch() as side-effect of SSR render
    // https://github.com/cloudflare/agents/blob/398c7f5411f3a63f450007f83db7e3f29b6ed4c2/packages/agents/src/ai-react.tsx#L85-L88
    getInitialMessages: typeof window === 'undefined' ? null : undefined
  })

  function mapUIMessages(messages: UIMessage[]): Message[] {
    return messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.parts?.map((p) => (p.type === 'text' ? p.text : '')).join('\n\n')
    }))
  }

  return (
    <ChatLayout title="RedwoodSDK Agent Chat">
      <MessageList messages={mapUIMessages(messages)} />
      {/* <div id="message-list" className="messages-wrapper">
        {messages?.map((m: Message) => (
          <div key={m.id} className="message">
            <strong>{`${m.role}: `}</strong>
            {m.parts?.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return (
                    <div key={i} className="message-content">
                      {part.text}
                    </div>
                  )
              }
            })}
            <br />
          </div>
        ))}
      </div> */}
      <MessageInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} onClear={clearHistory} />
    </ChatLayout>
  )
}
