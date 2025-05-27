import { DurableObject } from 'cloudflare:workers'

export type Message = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'data'
  content: string
}

export class ChatDurableObject extends DurableObject {
  private messages: Message[] = []

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    ctx.blockConcurrencyWhile(async () => {
      this.messages = (await ctx.storage.get('messages')) ?? []
    })
  }

  getMessages() {
    return this.messages
  }

  setMessage(message: Message) {
    const index = this.messages.findIndex((m) => m.id === message.id)
    if (index !== -1) {
      this.messages[index] = message
    } else {
      this.messages.push(message)
    }
    this.onUpdate()
  }

  clearMessages() {
    this.messages = []
    this.onUpdate()
  }

  private onUpdate() {
    // waituntil allows mutations to return immediately - won't reduce wall time
    // TODO: validate correctness under concurrency (ordering)
    this.ctx.waitUntil(this.saveMessages())
  }

  private async saveMessages() {
    if (this.messages.length > 0) {
      await this.ctx.storage.put('messages', this.messages)
    } else {
      await this.ctx.storage.deleteAll()
    }
  }
}
