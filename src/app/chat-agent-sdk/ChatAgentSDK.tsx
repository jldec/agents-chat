'use client'
import { ChatLayout } from '../shared/ChatLayout'
import { MessageInput } from '../shared/MessageInput'
import { MessageList } from '../shared/MessageList'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'
import { useEffect } from 'react'
import { ClientOnly } from '../shared/ClientOnly'
import { type OutgoingMessage } from 'agents/ai-types'

export function ChatAgentSDK() {
  const agent = useAgent({
    agent: 'chat-agent-sdk-durable-object', // kebab-cased binding name
    name: 'rwsdk-chat-agent-sdk'
  })

  const { messages, setMessages, input, handleInputChange, handleSubmit, clearHistory } = useAgentChat({
    agent
  })

  useEffect(() => {
    console.log('messages effect', messages.length)
    // update local messages when another client initiates an aiFetch
    // modeled after agents/src/ai-react.tsx
    function onMessages(event: MessageEvent) {
      if (typeof event.data !== 'string') {
        return
      }
      let data: OutgoingMessage
      try {
        data = JSON.parse(event.data) as OutgoingMessage
      } catch (error) {
        return
      }
      switch (data.type) {
        case 'cf_agent_use_chat_response':
          console.log('chat response messages', messages.length)
          console.log('chat response', data.id, data.body, data.done)
          break
        case 'cf_agent_chat_messages':
          console.log('chat messages', data.messages)
          break
        case 'cf_agent_chat_clear':
          console.log('chat clear')
          break
      }
    }
    agent.addEventListener('message', onMessages)
    return () => {
      agent.removeEventListener('message', onMessages)
    }
  }, [messages])

  return (
    <ChatLayout title="RedwoodSDK Agent SDK Chat">
      <MessageList messages={messages} />
      <MessageInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} onClear={clearHistory} />
    </ChatLayout>
  )
}

export function ClientOnlyChatAgentSDK() {
  return (
    <ClientOnly>
      <ChatAgentSDK />
    </ClientOnly>
  )
}
