'use client'
import { useEffect, useState } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { getMessages } from './functions'
import type { Message } from './ChatStore'

export function ChatClient() {
  console.log('Chat client wrapper')
  const [messages, setMessages] = useState<Message[]>([])
  useEffect(() => {
    async function fetchMessages() {
      const msgs = await getMessages()
      console.log('msgs', msgs)
      setMessages(msgs as Message[])
    }
    fetchMessages()
  }, [])
  return (
    <>
      <MessageList messages={messages} />
      <MessageInput />
    </>
  )
}
