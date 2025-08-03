import { Suspense } from 'react'
import { ChatLayout } from '../shared/ChatLayout'
import { ChatPubsubAgentClient } from './ChatPubsubAgentClient'
import { requestInfo as r } from 'rwsdk/worker'
import { getAgentByName } from 'agents'
import { env } from 'cloudflare:workers'

export async function ChatPubsubAgent() {
  const url = new URL(r.request.url)
  const pathname = url.pathname
  const raw = url.searchParams.has('raw')
  return (
    <ChatLayout title="RedwoodSDK Pubsub Agent Chat">
      <div className="px-2 text-right">
        <a href={`${pathname}`} className="text-blue-500 underline">
          Chat
        </a>{' | '}
        <a href={`${pathname}?raw`} className="text-blue-500 underline">
          Raw
        </a>
      </div>
      {raw ? (
        <pre>{JSON.stringify(await getMessages(), null, 2)}</pre>
      ) : (
        <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
          <ChatPubsubAgentClient />
        </Suspense>
      )}
    </ChatLayout>
  )
}

async function getMessages() {
  const agent = await getAgentByName(env.CHAT_PUBSUB_AGENT_DURABLE_OBJECT, 'main')
  // @ts-ignore
  const messages = await agent.getMessages()
  return messages
}
