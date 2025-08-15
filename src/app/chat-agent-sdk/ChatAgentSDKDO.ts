import { AIChatAgent } from 'agents/ai-chat-agent'
import { createWorkersAI } from 'workers-ai-provider'
import { env } from 'cloudflare:workers'
import { streamText, type StreamTextOnFinishCallback, type ToolSet } from 'ai'
import { systemMessageText } from '@/lib/systemMessageText'
const model = '@cf/meta/llama-3.1-8b-instruct-fp8-fast'

export class ChatAgentSDKDO extends AIChatAgent<Env> {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const workersai = createWorkersAI({ binding: env.AI })

    const stream = streamText({
      // @ts-expect-error (this 🦙 is not typed in ts)
      model: workersai(model),
      messages: [
        {
          role: 'system',
          content: systemMessageText('Agent SDK Chat', model)
        },
        ...this.messages
      ],
      maxTokens: 4096,
      onFinish
    })
    return stream.toDataStreamResponse()
  }
}
