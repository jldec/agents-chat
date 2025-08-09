'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { nanoid } from 'nanoid'
import type { Message } from '../shared/ChatStore'
import { Agent, run } from '@openai/agents'
import { systemMessageText } from '@/lib/systemMessageText'

const name = 'OpenaAI Agents SDK Chat'

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
  await chatStore.setMessage(promptMessage)
  await chatStore.setMessage(aiResponse)
  await syncRealtimeClients()

  const agent = new Agent({
    name,
    instructions: systemMessageText(name)
  })
  const result = await run(agent, prompt)

  aiResponse.content = result.finalOutput || 'no response'
  await chatStore.setMessage(aiResponse)
  await syncRealtimeClients()
}

export async function getMessages(): Promise<Message[]> {
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  return chatStore.getMessages()
}

export async function clearMessages(): Promise<void> {
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
