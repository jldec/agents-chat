'use client'
import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'
import type { Message } from '../shared/ChatStore'
import { nanoid } from 'nanoid'
import { useTable } from 'tinybase/ui-react'
import { useStore } from './store'

export function ChatTinybase() {
  const store = useStore()
  const messages = useTable('messages', store)

  const newMessage = async (prompt: string) => {
    const id = store.addRow(
      'messages',
      {
        id: nanoid(8),
        role: 'user',
        content: prompt
      },
      false
    ) // always append
  }

  const clearMessages = async () => {
    store.delTable('messages')
  }

  return (
    <ChatLayout title="RedwoodSDK TinyBase Chat">
      <MessageList messages={Object.values(messages) as Message[]} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
