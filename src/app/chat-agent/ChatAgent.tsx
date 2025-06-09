'use client'
import { useEffect, useState } from 'react'
import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'
import { getMessages, newMessage, clearMessages } from './client-functions'
import type { Message } from '../shared/ChatStore'
import { useAgent } from 'agents/react'

export function ChatAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [bump, setBump] = useState(0)

  async function fetchMessages() {
    setMessages(await getMessages() as Message[])
  }

  useEffect(() => {
    fetchMessages()
  }, [bump])

  const connection = useAgent({
    agent: 'websocket-agent',
    name: 'rwsdk-chat-client',
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
      <MessageInput onSubmit={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
