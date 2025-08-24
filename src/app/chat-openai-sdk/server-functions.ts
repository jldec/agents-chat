'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { systemMessageText } from '@/lib/systemMessageText'
import { Agent, run, type AgentInputItem, type AssistantMessageItem, user, assistant } from '@openai/agents'
import throttle from 'lodash/throttle'

const model = 'gpt-4o'
const name = 'OpenaAI Agents SDK Chat'
const throttleUpdatesMs = Number(env.THROTTLE_UPDATES_MS || 100)

export async function newMessage(prompt: string) {
  let updateCount = 0
  const instructions = systemMessageText(name, model)
  const messages = await getMessages()
  messages.push(user(prompt))
  messages.push(assistant('...')) // to be replaced with streaming text
  await setMessages(messages)

  // limit streaming updates to once every 100ms
  const throttledUpdate = throttle(async () => {
    updateCount++
    await setMessages(messages)
  }, throttleUpdatesMs)

  const agent = new Agent({
    name,
    model,
    instructions
  })
  // invoke the agent without the fake assistant message
  const result = await run(agent, [...messages.slice(0, -1)], { stream: true })
  let streamingText = ''
  for await (const chunk of result.toTextStream()) {
    streamingText += chunk
    messages[messages.length - 1] = assistant(streamingText)
    await throttledUpdate()
  }
  // console.log('newMessage updateCount', updateCount)
  await setMessages(result.history)
}

export async function getMessages(): Promise<AgentInputItem[]> {
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  const messages = await chatStore.getMessages()
  return messages as AgentInputItem[]
}

export async function setMessages(newMessages: AgentInputItem[]): Promise<void> {
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
