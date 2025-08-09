'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { nanoid } from 'nanoid'
import type { Message } from '../shared/ChatStore'
import { askAI } from '@/lib/askAI'
import { streamToText } from '@/lib/streamToText'

let messagesMemo: Message[] | null = null

export async function newMessage(prompt: string) {
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
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  const promptIndex = await chatStore.setMessage(promptMessage)
  const aiIndex = await chatStore.setMessage(aiResponse)
  messagesMemo = await chatStore.getMessages()
  messagesMemo[promptIndex] = promptMessage
  messagesMemo[aiIndex] = aiResponse
  await syncRealtimeClients()

  const stream = await askAI(await chatStore.getMessages(), 'OpenaAI Chat')
  aiResponse.content = '' // remove ... when stream starts
  // operate on memoized messages during streaming
  for await (const chunk of streamToText(stream)) {
    aiResponse.content += chunk
    syncRealtimeClients()
  }
  // update the chat store with the final response
  await chatStore.setMessage(aiResponse)
}

export async function getMessages(): Promise<Message[]> {
  if (messagesMemo) return messagesMemo
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  return chatStore.getMessages()
}

export async function clearMessages(): Promise<void> {
  messagesMemo = []
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  await chatStore.clearMessages()
  await syncRealtimeClients()
}

function resolveChatStore(chatID: string) {
  const id: DurableObjectId = env.OPENAI_CHATSTORE_DURABLE_OBJECT.idFromName(chatID)
  return env.OPENAI_CHATSTORE_DURABLE_OBJECT.get(id)
}

async function syncRealtimeClients() {
  // TODO: throttle?
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: env.REALTIME_KEY
  })
}

export async function ping() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  return 'pong'
}
