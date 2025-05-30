'use server'
import { env } from 'cloudflare:workers'
import { nanoid } from 'nanoid'
import { EventSourceParserStream } from 'eventsource-parser/stream'
import type { ChatDurableObject, Message } from './ChatStore'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'

const CHAT_ID = 'agents-chat'
const REALTIME_KEY = 'rwsdk-realtime-chat'
const WEBSOCKET_AGENT_NAME = 'rwsdk-chat-client'

export async function newMessage(prompt: string) {
  const message: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const chatStore = resolveChatStore(CHAT_ID)
  await chatStore.setMessage(message)
  await syncRealtimeClients()
  await syncWebsocketAgentClients(WEBSOCKET_AGENT_NAME)
  await askAI(chatStore)
  return message.id
}

export async function getMessages() {
  const chatStore = resolveChatStore(CHAT_ID)
  return chatStore.getMessages()
}

export async function clearMessages() {
  const chatStore = resolveChatStore(CHAT_ID)
  await chatStore.clearMessages()
  await syncRealtimeClients()
  await syncWebsocketAgentClients(WEBSOCKET_AGENT_NAME)
}

function resolveChatStore(chatID: string) {
  const id: DurableObjectId = env.CHAT_DURABLE_OBJECT.idFromName(chatID)
  return env.CHAT_DURABLE_OBJECT.get(id)
}

function resolveWebsocketAgent(agentName: string) {
  const id: DurableObjectId = env.WEBSOCKET_AGENT.idFromName(agentName)
  return env.WEBSOCKET_AGENT.get(id)
}

async function syncWebsocketAgentClients(agentName: string) {
  const agent = resolveWebsocketAgent(agentName)
  await agent.bumpClients()
}

async function syncRealtimeClients() {
  // TODO: throttle
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: REALTIME_KEY
  })
}

async function syncMessage(message: Message) {
  await syncRealtimeClients()
  const agent = resolveWebsocketAgent(WEBSOCKET_AGENT_NAME)
  await agent.syncMessage(message)
}

async function askAI(chatStore: DurableObjectStub<ChatDurableObject>) {
  const messages = await chatStore.getMessages()
  const systemMessage = {
    role: 'system',
    content: 'You are a helpful and delightful assistant'
  }
  try {
    // @ts-expect-error (small llama model is no longer in the catalog)
    const aiMessageStream = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8-fast', {
      stream: true,
      messages: [
        systemMessage,
        ...messages
      ]
    })) as ReadableStream

    const eventStream = aiMessageStream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())

    const aiMessage: Message = {
      id: nanoid(8),
      role: 'assistant',
      content: ''
    }

    // @ts-expect-error (don't know why eventStream is not typed right)
    for await (const event of eventStream) {
      if (event.data !== '[DONE]') {
        aiMessage.content += JSON.parse(event.data).response
        await chatStore.setMessage(aiMessage)
        syncMessage(aiMessage)
      } else {
        break
      }
    }
    return aiMessage
  } catch (err) {
    console.error(err)
  }
}
