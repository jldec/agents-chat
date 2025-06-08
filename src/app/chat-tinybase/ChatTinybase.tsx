'use client'
import { MessageList } from '../chat/MessageList'
import { MessageInput } from '../chat/MessageInput'
import { ChatLayout } from '../chat/ChatLayout'
import type { Message } from '../chat/ChatStore'
import { nanoid } from 'nanoid'
import { useTable } from 'tinybase/ui-react'
import { useStore } from './store'

export function ChatTinybase() {
  const store = useStore()
  const messages = useTable('messages', store)

  const newMessage = async (prompt: string) => {
    const id = store.addRow('messages', {
      id: nanoid(8),
      role: 'user',
      content: prompt
    }, false) // always append
  }

  const clearMessages = async () => {
    store.delTable('messages')
  }

  return (
    <ChatLayout title="RedwoodSDK TinyBase Chat">
      <MessageList messages={Object.values(messages) as Message[]} />
      <MessageInput onSubmit={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
