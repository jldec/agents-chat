'use server'
import { env } from 'cloudflare:workers'
import { nanoid } from 'nanoid'
import type {Message} from './ChatStore'

const CHAT_ID = 'agents-chat'

export async function newMessage(prompt: string) {
  const message: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const chat = resolve(CHAT_ID)
  await chat.setMessage(message)
  console.log('newMessage', message.id)
  return message.id
}

export async function getMessages() {
  const chat = resolve(CHAT_ID)
  return chat.getMessages()
}

export async function clearMessages() {
  const chat = resolve(CHAT_ID)
  await chat.clearMessages()
}

function resolve(chatID: string) {
  let id: DurableObjectId = env.CHAT_DURABLE_OBJECT.idFromName(chatID)
  return env.CHAT_DURABLE_OBJECT.get(id)
}