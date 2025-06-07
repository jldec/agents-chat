import { env } from 'cloudflare:workers'
import { EventSourceParserStream } from 'eventsource-parser/stream'
import { nanoid } from 'nanoid'
import type { Message } from '../chat/ChatStore'

/**
 * Asks the AI for a response based on the provided messages.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Message[]} params.messages - An array of messages to send to the AI.
 * @param {function} params.onUpdate - A callback function that is called with each update from the AI.
 *
 * @returns {Promise<Message>} A promise that resolves to the final AI message.
 *
 * @throws {Error} Throws an error if the AI request fails.
 */
export async function askAI({
  messages,
  onUpdate
}: {
  messages: Message[]
  onUpdate: (message: Message) => void // INTENTIONALLY NOT AWAITED to improve streaming performance
}) {
  console.log('askAI', messages)
  const systemMessage = {
    role: 'system',
    content: 'You are a helpful and delightful assistant'
  }
  try {
    // @ts-expect-error (small llama model is no longer in the catalog)
    const aiMessageStream = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8-fast', {
      stream: true,
      messages: [systemMessage, ...messages]
    })) as ReadableStream

    const eventStream = aiMessageStream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream())

    const aiMessage: Message = {
      id: nanoid(8),
      role: 'assistant',
      content: ''
    }

    // @ts-expect-error (don't know why eventStream is not typed right)
    for await (const event of eventStream) {
      if (event.data !== '[DONE]') {
        aiMessage.content += JSON.parse(event.data).response
      }
      onUpdate(aiMessage)
    }
    return aiMessage
  } catch (err) {
    console.error(err)
  }
}
