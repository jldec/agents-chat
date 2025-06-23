import { Suspense } from 'react'
import { ChatLayout } from '../shared/ChatLayout'
import { ChatAgentAgentClient } from './ChatAgentAgentClient'
import { requestInfo } from 'rwsdk/worker'

export function ChatAgentAgent() {
  requestInfo.headers.set('cache-control', 'public, max-age=60')
  return (
    <ChatLayout title="RedwoodSDK Agent Agent Chat">
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
        <ChatAgentAgentClient />
      </Suspense>
    </ChatLayout>
  )
}
