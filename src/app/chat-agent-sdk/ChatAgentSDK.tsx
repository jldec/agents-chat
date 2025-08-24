'use client'
import { ChatLayout } from '../components/ChatLayout'
import { MessageInput } from '../components/MessageInput'
import { MessageListUI } from '../components/MessageListUI'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'

export function ChatAgentSDK() {
  const agent = useAgent({
    agent: 'chat-agent-sdk-durable-object', // kebab-cased binding name
    name: 'rwsdk-chat-agent-sdk'
  })

  const { messages, input, handleInputChange, handleSubmit, clearHistory } = useAgentChat({
    agent
  })

  return (
    <ChatLayout title="RedwoodSDK Agent SDK Chat">
      <MessageListUI messages={messages} />
      <MessageInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} onClear={clearHistory} />
    </ChatLayout>
  )
}
