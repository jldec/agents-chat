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
  })

  function mapUIMessages(messages: UIMessage[]): Message[] {
    return messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.parts?.map((p) => (p.type === 'text' ? p.text : '')).join('\n\n')
    }))
  }

  return (
    <ChatLayout title="RedwoodSDK Agent SDK Chat">
      <MessageList messages={mapUIMessages(messages)} />
      <MessageInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} onClear={clearHistory} />
    </ChatLayout>
  )
}
