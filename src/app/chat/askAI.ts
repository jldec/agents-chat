import { env } from 'cloudflare:workers'
import type { Message } from '../chat/ChatStore'

export async function askAI(messages: Message[]) {
  const systemMessage = {
    role: 'system',
    content: 'You are a helpful and delightful assistant'
  }
  // @ts-expect-error (small fast llama not in the catalog)
  return (await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8-fast', {
    stream: true,
    messages: [systemMessage, ...messages]
  })) as ReadableStream
}
