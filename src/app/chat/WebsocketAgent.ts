import { Agent, Connection, type ConnectionContext, type WSMessage } from 'agents'
import type { Message } from './ChatStore'

// https://developers.cloudflare.com/agents/api-reference/agents-api/
// https://developers.cloudflare.com/agents/api-reference/websockets/
export class WebsocketAgent extends Agent<Env> {
  async onConnect(connection: Connection, ctx: ConnectionContext) {
    console.log('onConnect', connection.server)
  }

  async onMessage(connection: Connection, message: WSMessage) {
    console.log('onMessage', message)
    await connection.send(message) // echo
  }

  async bumpClients() {
    console.log('bump')
    this.broadcast('bump')
  }

  async syncMessage(message: Message) {
    console.log('syncMessage', message.id, message.content.length)
    this.broadcast(JSON.stringify(message))
  }
}
