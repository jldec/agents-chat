'use client'
import { MessageInput } from '../components/MessageInput'
import { MessageList } from '../components/MessageList'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'

export function ChatAgentAgentClient() {
  const agent = useAgent({
    agent: 'chat-agent-agent-durable-object', // kebab-cased binding name
    name: 'main' // see src/app/chat-agent-agent/tools.ts
  })

  const { messages, input, handleInputChange, handleSubmit, clearHistory } = useAgentChat({
    agent
  })

  return (
    <>
      <MessageList messages={messages} />
      <MessageInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} onClear={clearHistory} />
    </>
  )
}
