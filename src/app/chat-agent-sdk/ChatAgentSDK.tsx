'use client'
import { useState } from 'react'
import { ChatLayout } from '../components/ChatLayout'
import { MessageInput } from '../components/MessageInput'
import { MessageListUI } from '../components/MessageListUI'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'

export function ChatAgentSDK() {
  const [input, setInput] = useState('')

  const agent = useAgent({
    agent: 'chat-agent-sdk-durable-object', // kebab-cased binding name
    name: 'rwsdk-chat-agent-sdk'
  })

  const { messages, sendMessage, clearHistory } = useAgentChat({
    agent
  })

  return (
    <ChatLayout title="RedwoodSDK Agent SDK Chat (ai sdk v5)">
      <MessageListUI messages={messages} />
      <MessageInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={async (e: React.FormEvent) => {
          console.log('onSubmit', input)
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
