'use client'
import { useState } from 'react'
import { ChatLayout } from '../components/ChatLayout'
import { MessageInput } from '../components/MessageInput'
import { UIMessageList } from './UIMessageList'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'

export function ChatAgentSDK() {
  const [input, setInput] = useState('')

  const agent = useAgent({
    agent: 'chat-agent-sdk-durable-object', // kebab-cased binding name
    name: 'rwsdk-chat-agent-sdk'
  })

  const { messages, status, error, sendMessage, clearHistory } = useAgentChat({
    agent
  })

  return (
    <ChatLayout title="RedwoodSDK Agent SDK Chat (ai sdk v5)">
      <div className="text-gray-500">Status: {status}</div>
      { error && <div className="text-red-500 text-sm border border-red-500 rounded-md p-2 my-4">Error: {error.message}</div> }
      <UIMessageList messages={messages} />
      <MessageInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={async (e: React.FormEvent) => {
          e.preventDefault()
          if (!input.trim()) return
          let text = input
          setInput('') // clear immediately for feedback
          await sendMessage({ text })
        }}
        onClear={clearHistory}
      />
    </ChatLayout>
  )
}
