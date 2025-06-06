// from https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object/blob/main/server/index.ts
import { createMergeableStore, Id, IdAddedOrRemoved } from 'tinybase'
import { createDurableObjectStoragePersister } from 'tinybase/persisters/persister-durable-object-storage'
import { WsServerDurableObject } from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'

const PERSIST_TO_DURABLE_OBJECT = false

export class TinyBaseDurableObject extends WsServerDurableObject {
  onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
    console.info((addedOrRemoved ? 'Added' : 'Removed') + ` path ${pathId}`)
  }

  onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
    console.info((addedOrRemoved ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
  }

  createPersister() {
    if (PERSIST_TO_DURABLE_OBJECT) {
      return createDurableObjectStoragePersister(createMergeableStore(), this.ctx.storage)
    }
  }
}
