import { env } from 'cloudflare:workers'
import type { Message } from '../app/shared/ChatStore'

/**
 * Asks the AI for a response
 * @param messages - context sent to the LLM
 * @returns ReadableStream with the response
 */
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

/**
 * Processes a response stream
 * @param stream - The stream from the AI.
 * @returns An async iterable iterator of strings.
 */
export async function* streamToText(stream: ReadableStream<Uint8Array>): AsyncIterableIterator<string> {
  // https://grok.com/share/bGVnYWN5_021e85a1-a199-4ac9-bcfb-29233b50a72e
  // TODO: validate special cases, like comments or other line terminators
  // see https://github.com/rexxars/eventsource-parser/blob/main/src/parse.ts
  const decoder = new TextDecoder()
  const reader = stream.getReader()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n') // assume no newlines in data
      buffer = lines.pop() || '' // last line may be incomplete

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            return // we're done
          }
          try {
            const parsed = JSON.parse(data)
            const text = parsed.response || ''
            if (text) {
              yield text
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
    // Ignore any remaining buffer
  } finally {
    reader.releaseLock()
  }
}
