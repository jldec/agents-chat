'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { nanoid } from 'nanoid'
import type { Message } from '../shared/ChatStore'
import { askAI } from '@/lib/askAI'
import { streamToText } from '@/lib/streamToText'
import throttle from 'lodash/throttle'

// limit streaming updates to once every 100ms
const throttleUpdatesMs = Number(env.THROTTLE_UPDATES_MS || 100)

export async function newMessage(prompt: string) {
  let updateCount = 0
  const promptMessage: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const aiResponse: Message = {
    id: nanoid(8),
    role: 'assistant',
    content: '...'
  }
  const chatStore = resolveChatStore(env.RWSDK_CHATSTORE)
  await chatStore.setMessage(promptMessage)
  await chatStore.setMessage(aiResponse)
  await syncRealtimeClients()

  const throttledUpdate = throttle(async () => {
    updateCount++
    await chatStore.setMessage(aiResponse)
    await syncRealtimeClients()
  }, throttleUpdatesMs)

  const stream = await askAI(await chatStore.getMessages(), 'RSC Chat')
  aiResponse.content = ''
  for await (const chunk of streamToText(stream)) {
    aiResponse.content += chunk
    throttledUpdate()
  }
  // console.log('newMessage updateCount', updateCount)
  // console.log('newMessage aiResponse.content', aiResponse.content)
  await syncRealtimeClients()
}

export async function getMessages(): Promise<Message[]> {
  const chatStore = resolveChatStore(env.RWSDK_CHATSTORE)
  return chatStore.getMessages()
}

export async function clearMessages(): Promise<void> {
  const chatStore = resolveChatStore(env.RWSDK_CHATSTORE)
  await chatStore.clearMessages()
  await syncRealtimeClients()
}

function resolveChatStore(chatID: string) {
  const id: DurableObjectId = env.CHATSTORE_DURABLE_OBJECT.idFromName(chatID)
  return env.CHATSTORE_DURABLE_OBJECT.get(id)
}

async function syncRealtimeClients() {
  // console.log('syncRealtimeClients')
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: env.REALTIME_KEY
  })
}

export async function ping() {
  await new Promise((resolve) => setTimeout(resolve, 250))
  return 'pong'
}
