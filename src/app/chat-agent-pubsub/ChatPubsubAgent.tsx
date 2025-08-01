import { Suspense } from 'react'
import { ChatLayout } from '../shared/ChatLayout'
import { ChatPubsubAgentClient } from './ChatPubsubAgentClient'

export function ChatPubsubAgent() {
  return (
    <ChatLayout title="RedwoodSDK Pubsub Agent Chat">
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
        <ChatPubsubAgentClient />
      </Suspense>
    </ChatLayout>
  )
}
