import { Agent, Connection, type ConnectionContext, type WSMessage } from 'agents'
import type { Message } from '@/lib/types'

// https://developers.cloudflare.com/agents/api-reference/agents-api/
// https://developers.cloudflare.com/agents/api-reference/websockets/
export class WebsocketAgent extends Agent<Env> {
  async onConnect(connection: Connection) {
    console.log('onConnect', connection.server)
  }

  async bumpClients() {
    console.log('bump')
    this.broadcast('bump')
  }

  async syncMessage(message: Message) {
    this.broadcast(JSON.stringify(message))
  }
}
