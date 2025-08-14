'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { systemMessageText } from '@/lib/systemMessageText'
import { Agent, run, type AgentInputItem, user } from '@openai/agents'
import { type Message } from '../shared/ChatStore'
import throttle from 'lodash/throttle'

const name = 'OpenaAI Agents SDK Chat'
const throttleUpdatesMs = Number(env.THROTTLE_UPDATES_MS || 100)

export async function newMessage(prompt: string) {
  let updateCount = 0
  const messages = await getMessages()
  const userMessage = user(prompt)
  messages.push(userMessage)
  const streamingMessage: Message = { id: 'streaming', role: 'assistant', content: '...' }
  messages.push(streamingMessage)
  await setMessages(messages)

  // limit streaming updates to once every 100ms
  const throttledUpdate = throttle(async () => {
    updateCount++
    await setMessages(messages)
  }, throttleUpdatesMs)

  const agent = new Agent({
    name,
    model: 'gpt-5',
    instructions: systemMessageText(name)
  })
  // run the agent without the streaming message
  const result = await run(agent, [...messages.slice(0, -1)] as AgentInputItem[], { stream: true })
  streamingMessage.content = ''
  for await (const chunk of result.toTextStream()) {
    streamingMessage.content += chunk
    await throttledUpdate()
  }
  // console.log('newMessage updateCount', updateCount)
  await setMessages(result.history)
}

export async function getMessages(): Promise<(AgentInputItem | Message)[]> {
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  const messages = await chatStore.getMessages()
  return messages as AgentInputItem[]
}

export async function setMessages(newMessages: (AgentInputItem | Message)[]): Promise<void> {
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  await chatStore.setMessages(newMessages)
  await syncRealtimeClients()
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
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: env.OPENAI_REALTIME_KEY
  })
}

export async function ping() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  return 'pong'
}
