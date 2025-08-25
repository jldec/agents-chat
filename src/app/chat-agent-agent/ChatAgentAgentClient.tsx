'use client'
import { MessageInput } from '../components/MessageInput'
import { MessageListUI } from '../components/MessageListUI'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'
import { useState } from 'react'

export function ChatAgentAgentClient() {
  const [input, setInput] = useState('')

  const agent = useAgent({
    agent: 'chat-agent-agent-durable-object', // kebab-cased binding name
    name: 'main' // see src/app/chat-agent-agent/tools.ts
  })

  const { messages, sendMessage, clearHistory } = useAgentChat({
    agent
  })

  return (
    <>
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
    </>
  )
}
