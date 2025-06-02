'use client'
import { useEffect, useState } from 'react'
import { MessageList } from '../chat/MessageList'
import { MessageInput } from '../chat/MessageInput'
import { ChatLayout } from '../chat/ChatLayout'
import { getMessages } from '../chat-rsc/functions'
import type { Message } from '../chat/ChatStore'
import { useAgent } from "agents/react";

export function ChatAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [bump, setBump] = useState(0)

  const connection = useAgent({
    agent: "websocket-agent",
    name: "rwsdk-chat-client",
    onMessage: (message) => {
      if (message.data === 'bump') {
        setBump((bump) => bump + 1)
        console.log('bump', bump)
      }
      if (message.data.startsWith('{')) {
        const msg = JSON.parse(message.data) as Message
        console.log('message', msg.content.length)
        setMessages((messages) => {
          const index = messages.findIndex(m => m.id === msg.id);
          if (index !== -1) {
            // Update the existing message
            const updatedMessages = [...messages];
            updatedMessages[index] = msg;
            return updatedMessages;
          } else {
            // Add the new message
            return [...messages, msg];
          }
        });
      }
    },
    onOpen: () => console.log("Connection established"),
    onClose: () => console.log("Connection closed"),
  });

  useEffect(() => {
    console.log('fetching messages')
    async function fetchMessages() {
      const msgs = await getMessages()
      setMessages(msgs as Message[])
    }
    fetchMessages()
  }, [bump])

  return (
    <ChatLayout title="RedwoodSDK Agent Chat">
      <MessageList messages={messages} />
      <MessageInput />
    </ChatLayout>
  )
}
