'use client'
import { useEffect, useState } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { getMessages } from './functions'
import type { Message } from './ChatStore'
import { useAgent } from "agents/react";

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([])

  const connection = useAgent({
    agent: "websocket-agent",
    name: "rwsdk-chat-client",
    onMessage: (message) => {
      console.log("Understanding received:", message.data);
    },
    onOpen: () => console.log("Connection established"),
    onClose: () => console.log("Connection closed"),
  });

  useEffect(() => {
    async function fetchMessages() {
      const msgs = await getMessages()
      setMessages(msgs as Message[])
    }
    fetchMessages()
  }, [])

  function handleSend(message: string) {
    connection.send(message)
  }

  return (
    <>
      <MessageList messages={messages} />
      <MessageInput />
      <button onClick={() => handleSend('Hello, world!')} className="border-blue-500 cursor-pointer hover:translate-y-0.5 border-1 p-2 rounded-md mt-2">Send</button>
    </>
  )
}
