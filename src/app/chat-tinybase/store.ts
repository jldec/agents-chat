import ReconnectingWebSocket from 'reconnecting-websocket'
import { createMergeableStore, MergeableStore } from 'tinybase'
import { createLocalPersister } from 'tinybase/persisters/persister-browser'
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client'
import { useCreateMergeableStore, useCreatePersister, useCreateSynchronizer, useTable } from 'tinybase/ui-react'

const TINYBASE_SYNC_ROUTE = '/tinybase/websocket/sync'

// Returns memoized TinyBase store with localstorage persister and websocket synchronizer
// from https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object/blob/main/client/src/App.tsx
export function useStore() {
  const store = useCreateMergeableStore(createMergeableStore)

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

  return store
}
