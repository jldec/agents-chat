import { env } from 'cloudflare:workers'
import { nanoid } from 'nanoid'
import type { Message } from '../chat/ChatStore'
import { askAI } from '../chat/askAI'
import { route } from 'rwsdk/router'
import type { RequestInfo } from 'rwsdk/worker'
import { routeAgentRequest } from 'agents'
import type { WebsocketAgent } from './WebsocketAgent'
import { streamToText } from '../utils/stream'

async function GET() {
  try {
    const chatStore = resolveChatStore(env.CHAT_ID)
    const messages = await chatStore.getMessages()
    return Response.json(messages)
  } catch (error) {
    return Response.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}

async function DELETE() {
  try {
    const chatStore = resolveChatStore(env.CHAT_ID)
    await chatStore.clearMessages()
    const agent = resolveWebsocketAgent()
    await agent.bumpClients()
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to clear messages' }, { status: 500 })
  }
}

async function POST(request: Request) {
  try {
    const { prompt }: { prompt: string } = await request.json()
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }
    await newMessage(prompt)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to create message' }, { status: 500 })
  }
}

export const chatAgentApiRoutes = [
  // https://developers.cloudflare.com/agents/api-reference/calling-agents/
  route(`/agents/${env.WEBSOCKET_AGENT_PATH}/${env.WEBSOCKET_AGENT_NAME}`, async ({ request }) => {
    return (await routeAgentRequest(request, env)) || Response.json({ msg: 'no agent here' }, { status: 404 })
  }),
  route('/api/chat-agent', (requestInfo: RequestInfo) => {
    switch (requestInfo.request.method) {
      case 'GET':
        return GET()
      case 'DELETE':
        return DELETE()
      case 'POST':
        return POST(requestInfo.request)
      default:
        return Response.json({ error: 'unsupported method' }, { status: 405 })
    }
  })
]

async function newMessage(prompt: string) {
  const promptMessage: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const aiResponse: Message = {
    id: nanoid(8),
    role: 'assistant',
    content: ''
  }
  const chatStore = resolveChatStore(env.CHAT_ID)
  const agent = resolveWebsocketAgent()

  await chatStore.setMessage(promptMessage)
  await chatStore.setMessage(aiResponse)
  await agent.bumpClients()

  const stream = await askAI(await chatStore.getMessages())
  for await (const chunk of streamToText(stream)) {
    aiResponse.content += chunk
    agent.syncMessage(aiResponse)
  }
  await chatStore.setMessage(aiResponse)
}

function resolveChatStore(chatID: string) {
  const id: DurableObjectId = env.CHAT_DURABLE_OBJECT.idFromName(chatID)
  return env.CHAT_DURABLE_OBJECT.get(id)
}

function resolveWebsocketAgent() {
  const id = env.WEBSOCKET_AGENT.idFromName(env.WEBSOCKET_AGENT_NAME)
  const agent = env.WEBSOCKET_AGENT.get(id)
  return agent
}
