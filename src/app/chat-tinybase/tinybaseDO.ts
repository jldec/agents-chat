// from https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object/blob/main/server/index.ts
import { createMergeableStore } from 'tinybase'
import { createDurableObjectStoragePersister } from 'tinybase/persisters/persister-durable-object-storage'
import { WsServerDurableObject } from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'
import { askAI } from '../chat/askAI'
import type { Message } from '../chat/ChatStore'
import { streamToText } from '../utils/stream'
import { nanoid } from 'nanoid'

export class TinyBaseDurableObject extends WsServerDurableObject {
 createPersister() {
    const persister = createDurableObjectStoragePersister(createMergeableStore(), this.ctx.storage)
    const store = persister.getStore()
    store.addHasRowListener('messages', null, (store, tableId, rowId, hasRow) => {
      if (hasRow) {
        const message = store.getRow(tableId, rowId)
        console.log('new message', rowId)
        // only ask agent if no aiRowId yet
        if (message.role === 'user' && !message.aiRowId) {
          // set aiRowId to _ before asking agent to avoid races
          store.setPartialRow(tableId, rowId, { aiRowId: '_' })
          console.log('asking agent', message.content)
          const messages = Object.values(store.getTable(tableId)) as Message[]
          askAI(messages).then(async (stream) => {
            let content = ''

            let aiRowId = store.addRow(tableId, {
              id: nanoid(8),
              role: 'assistant',
              content
            }, false) // always append
            if (!aiRowId) {
              console.error('failed to add agent response to store')
              return
            }
            store.setPartialRow(tableId, rowId, { aiRowId })

            for await (const chunk of streamToText(stream)) {
              content += chunk
              store.setPartialRow(tableId, aiRowId, { content })
            }
            console.log(`agent responded to ${rowId} with ${aiRowId}`)
          })
        }
      } else {
        console.log('message deleted', rowId)
      }
    })
    return persister
  }
}
