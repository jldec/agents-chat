import { env } from 'cloudflare:workers'
import type { Message } from '../chat/ChatStore'

export async function askAI(messages: Message[]) {
  const systemMessage = {
    role: 'system',
    content: 'You are a helpful and delightful assistant'
  }
  // @ts-expect-error (this 🦙 is not typed in ts)
  // https://developers.cloudflare.com/workers-ai/platform/pricing/
  return (await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8-fast', {
    stream: true,
    max_tokens: 4096,
    messages: [systemMessage, ...messages]
  })) as ReadableStream<Uint8Array>
}
