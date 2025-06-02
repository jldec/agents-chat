import { env } from 'cloudflare:workers'
import { EventSourceParserStream } from 'eventsource-parser/stream'
import { nanoid } from 'nanoid'
import type { ChatDurableObject, Message } from '../chat/ChatStore'

export async function askAI({
  chatStore,
  onUpdate,
  saveBeforeUpdate: saveBeforeUpdate = true
}: {
  chatStore: DurableObjectStub<ChatDurableObject>
  onUpdate: (message: Message) => void // INTENTIONALLY NOT AWAITED to improve streaming performance
  saveBeforeUpdate: boolean
}) {
  const messages = await chatStore.getMessages()
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
        if (saveBeforeUpdate) {
          await chatStore.setMessage(aiMessage)
        }
        onUpdate(aiMessage)
      } else {
        await chatStore.setMessage(aiMessage)
        onUpdate(aiMessage)
      }
    }
    return aiMessage
  } catch (err) {
    console.error(err)
  }
}
