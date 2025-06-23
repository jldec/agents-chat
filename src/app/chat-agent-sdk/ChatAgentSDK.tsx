'use client'
import { ChatLayout } from '../shared/ChatLayout'
import { MessageInput } from '../shared/MessageInput'
import { MessageList } from '../shared/MessageList'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'
import { requestInfo } from 'rwsdk/worker'

export function ChatAgentSDK() {
  requestInfo.headers.set('cache-control', 'public, max-age=60')

  const agent = useAgent({
    agent: 'chat-agent-sdk-durable-object', // kebab-cased binding name
    name: 'rwsdk-chat-agent-sdk'
  })

  const { messages, input, handleInputChange, handleSubmit, clearHistory } = useAgentChat({
    agent
  })

  return (
    <ChatLayout title="RedwoodSDK Agent SDK Chat">
      <MessageList messages={messages} />
      <MessageInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} onClear={clearHistory} />
    </ChatLayout>
  )
}
