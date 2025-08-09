'use server'
import { env } from 'cloudflare:workers'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { systemMessageText } from '@/lib/systemMessageText'
import { Agent, run, type AgentInputItem, user } from '@openai/agents'
import { type Message } from '../shared/ChatStore'

const name = 'OpenaAI Agents SDK Chat'

let historyMemo: (AgentInputItem | Message)[] = []

export async function newMessage(prompt: string) {
  const messages = await getMessages()
  const userMessage = user(prompt)
  messages.push(userMessage)
  // temporary message to stream text to clients via historyMemo
  const streamingMessage: Message = { id: 'streaming', role: 'assistant', content: '...' }
  messages.push(streamingMessage)
  await setMessages(messages)

  const agent = new Agent({
    name,
    instructions: systemMessageText(name)
  })
  // run the agent without the streaming message
  const result = await run(agent, [...messages.slice(0, -1)] as AgentInputItem[], { stream: true })
  streamingMessage.content = ''
  for await (const chunk of result.toTextStream()) {
    streamingMessage.content += chunk
    syncRealtimeClients()
  }
  // finally save the new history to the chat store
  await setMessages(result.history)
}

export async function getMessages(): Promise<(AgentInputItem | Message)[]> {
  if (historyMemo.length > 0) return historyMemo
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  const messages = await chatStore.getMessages()
  historyMemo = messages as AgentInputItem[]
  return messages as AgentInputItem[]
}

export async function setMessages(newMessages: (AgentInputItem | Message)[]): Promise<void> {
  const chatStore = resolveChatStore(env.OPENAI_CHATSTORE)
  await chatStore.setMessages(newMessages)
  historyMemo = newMessages
  await syncRealtimeClients()
}

export async function clearMessages(): Promise<void> {
  historyMemo = []
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
    key: env.OPENAI_REALTIME_KEY
  })
}

export async function ping() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  return 'pong'
}
