'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { nanoid } from 'nanoid'
import type { Message } from '../chat/ChatStore'
import { askAI } from '../chat/askAI'

export async function newMessage(prompt: string): Promise<void> {
  const message: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const chatStore = resolveChatStore(env.CHAT_ID)
  await chatStore.setMessage(message)
  await syncRealtimeClients()
  await askAI(chatStore, syncMessage)
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

async function syncMessage(message: Message) {
  await syncRealtimeClients()
}
