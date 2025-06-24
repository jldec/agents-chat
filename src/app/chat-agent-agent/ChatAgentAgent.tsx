import { Suspense } from 'react'
import { ChatLayout } from '../shared/ChatLayout'
import { ChatAgentAgentClient } from './ChatAgentAgentClient'

export function ChatAgentAgent() {
  return (
    <ChatLayout title="RedwoodSDK Agent Agent Chat">
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
        <ChatAgentAgentClient />
      </Suspense>
    </ChatLayout>
  )
}
