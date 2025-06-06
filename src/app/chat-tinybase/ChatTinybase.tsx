'use client'
import { useEffect, useState } from 'react'
import { MessageList } from '../chat/MessageList'
import { MessageInput } from '../chat/MessageInput'
import { ChatLayout } from '../chat/ChatLayout'
import type { Message } from '../chat/ChatStore'
import { nanoid } from 'nanoid'

import ReconnectingWebSocket from 'reconnecting-websocket'
import { createMergeableStore, MergeableStore } from 'tinybase'
import { createLocalPersister } from 'tinybase/persisters/persister-browser'
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client'
import { useCreateMergeableStore, useCreatePersister, useCreateSynchronizer } from 'tinybase/ui-react'

const TINYBASE_SYNC_ROUTE = '/tinybase/websocket/sync'

// singleton component, hardwired to the tinybase sync route and store
export function ChatTinybase() {
  const [messages, setMessages] = useState<Message[]>([])

  const store = useCreateMergeableStore(() => {
    return createMergeableStore().setTablesSchema({
      messages: {
        id: { type: 'string' },
        content: { type: 'string' },
        role: { type: 'string', default: 'user' }
      }
    })
  })

  useEffect(() => {
    const listener = store.addTableListener('messages', () => {
      const messages = Object.values(store.getTable('messages')) as unknown as Message[]
      console.log('messages changed:', messages)
      setMessages(messages)
    })
    return () => {
      store.delListener(listener)
    }
  }, [])

  useCreatePersister(
    store,
    (store) => createLocalPersister(store, 'local:' + TINYBASE_SYNC_ROUTE),
    [],
    async (persister) => {
      await persister.startAutoLoad()
      await persister.startAutoSave()
    }
  )

  useCreateSynchronizer(store, async (store: MergeableStore) => {
    const synchronizer = await createWsSynchronizer(
      store,
      new ReconnectingWebSocket(window.location.origin.replace('http', 'ws') + TINYBASE_SYNC_ROUTE),
      1
    )
    await synchronizer.startSync()

    // If the websocket reconnects in the future, do another explicit sync.
    synchronizer.getWebSocket().addEventListener('open', () => {
      synchronizer.load().then(() => synchronizer.save())
    })

    return synchronizer
  })

  const newMessage = async (prompt: string) => {
    const id = store.addRow('messages', {
      id: nanoid(8),
      content: prompt
    })
  }

  const clearMessages = async () => {
    store.delTable('messages')
  }

  return (
    <ChatLayout title="RedwoodSDK Tinybase Chat">
      <MessageList messages={messages} />
      <MessageInput onSubmit={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
