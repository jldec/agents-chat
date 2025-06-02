import { env } from 'cloudflare:workers'
import { nanoid } from 'nanoid'
import type { Message } from '../chat/ChatStore'
import { askAI } from '../chat/askAI'
import { route } from 'rwsdk/router'
import type { RequestInfo } from 'rwsdk/worker'

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
    await syncWebsocketAgentClients(env.WEBSOCKET_AGENT_NAME)
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
  const message: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const chatStore = resolveChatStore(env.CHAT_ID)
  await chatStore.setMessage(message)
  await syncWebsocketAgentClients(env.WEBSOCKET_AGENT_NAME)
  await askAI(chatStore, syncMessage)
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

async function syncMessage(message: Message) {
  const agent = resolveWebsocketAgent(env.WEBSOCKET_AGENT_NAME)
  await agent.syncMessage(message)
}
