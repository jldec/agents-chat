'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { nanoid } from 'nanoid'
import type { Message } from '../chat/ChatStore'
import { askAI } from '../chat/askAI'
import { streamToText } from '../utils/stream'

export async function newMessage(prompt: string): Promise<void> {
  const message: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const aiMessage: Message = {
    id: nanoid(8),
    role: 'assistant',
    content: ''
  }
  const chatStore = resolveChatStore(env.CHAT_ID)
  await chatStore.setMessage(message)
  await chatStore.setMessage(aiMessage)
  await syncRealtimeClients()
  const stream = await askAI(await chatStore.getMessages())
  for await (const chunk of streamToText(stream)) {
    aiMessage.content += chunk
    await chatStore.setMessage(aiMessage)
    syncRealtimeClients()
  }
}

export async function getMessages(): Promise<Message[]> {
  const chatStore = resolveChatStore(env.CHAT_ID)
  return chatStore.getMessages()
}

export async function clearMessages(): Promise<void> {
  const chatStore = resolveChatStore(env.CHAT_ID)
  await chatStore.clearMessages()
  await syncRealtimeClients()
}

function resolveChatStore(chatID: string) {
  const id: DurableObjectId = env.CHAT_DURABLE_OBJECT.idFromName(chatID)
  return env.CHAT_DURABLE_OBJECT.get(id)
}

async function syncRealtimeClients() {
  // TODO: throttle?
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: env.REALTIME_KEY
  })
}
