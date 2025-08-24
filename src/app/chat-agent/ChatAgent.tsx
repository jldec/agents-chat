'use client'
import { useEffect, useState } from 'react'
import { MessageList } from '../components/MessageList'
import { MessageInput } from '../components/MessageInput'
import { ChatLayout } from '../components/ChatLayout'
import { getMessages, newMessage, clearMessages } from './client-functions'
import type { Message } from '@/lib/types'
import { useAgent } from 'agents/react'

export function ChatAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [bump, setBump] = useState(0)

  async function fetchMessages() {
    setMessages((await getMessages()) as Message[])
  }

  useEffect(() => {
    fetchMessages()
  }, [bump])

  const connection = useAgent({
    agent: 'websocket-durable-object',
    name: 'rwsdk-chat-agent',
    onMessage: (message) => {
      if (message.data === 'bump') {
        setBump((bump) => bump + 1)
      }
      // Very lazy way to detect update messages
      // TODO: message types
      if (message.data.startsWith('{')) {
        const msg = JSON.parse(message.data) as Message
        setMessages((messages) => {
          const index = messages.findIndex((m) => m.id === msg.id)
          if (index !== -1) {
            // Update the existing message
            const updatedMessages = [...messages]
            updatedMessages[index] = msg
            return updatedMessages
          } else {
            // Add the new message
            return [...messages, msg]
          }
        })
      }
    },
    onOpen: () => console.log('Connection established'),
    onClose: () => console.log('Connection closed')
  })

  return (
    <ChatLayout title="RedwoodSDK Agent Chat">
      <MessageList messages={messages} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
