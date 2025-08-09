import { DurableObject } from 'cloudflare:workers'
import { type AgentInputItem } from '@openai/agents'
import { type Message } from './ChatStore'

export class OpenaiChatstoreDurableObject extends DurableObject {
  private messages: (AgentInputItem | Message)[] = []

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    ctx.blockConcurrencyWhile(async () => {
      this.messages = (await ctx.storage.get('messages')) ?? []
    })
  }

  /**
   * Returns the messages array.
   */
  getMessages() {
    return this.messages
  }

  /**
   * Sets the messages array.
   */
  setMessages(messages: (AgentInputItem | Message)[]) {
    this.messages = messages
    this.onUpdate()
  }

  /**
   * Clears all messages from the chat store.
   */
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
