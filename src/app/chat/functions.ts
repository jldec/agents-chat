'use server'
import { env } from 'cloudflare:workers'
import { nanoid } from 'nanoid'
import { EventSourceParserStream } from 'eventsource-parser/stream'
import type { ChatDurableObject, Message } from './ChatStore'
import { renderRealtimeClients } from 'rwsdk/realtime/worker'

const CHAT_ID = 'agents-chat'
const REALTIME_KEY = 'rwsdk-realtime-chat'

export async function newMessage(prompt: string) {
  const message: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const chat = resolve(CHAT_ID)
  await chat.setMessage(message)
  console.log('newMessage', message.id)
  await askAI(chat)
  await syncRealtimeClients()
  return message.id
}

export async function getMessages() {
  const chat = resolve(CHAT_ID)
  return chat.getMessages()
}

export async function clearMessages() {
  const chat = resolve(CHAT_ID)
  await chat.clearMessages()
  await syncRealtimeClients()
}

function resolve(chatID: string) {
  const id: DurableObjectId = env.CHAT_DURABLE_OBJECT.idFromName(chatID)
  return env.CHAT_DURABLE_OBJECT.get(id)
}

async function syncRealtimeClients() {
  // TODO: throttle
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: REALTIME_KEY
  })
}

async function askAI(chat: DurableObjectStub<ChatDurableObject>) {
  const messages = await chat.getMessages()
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
        await chat.setMessage(aiMessage)
        await syncRealtimeClients()
        console.log('aiMessage updated')
      } else {
        break
      }
    }
    return aiMessage
  } catch (err) {
    console.error(err)
  }
}
