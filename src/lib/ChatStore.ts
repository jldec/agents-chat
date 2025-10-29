import { DurableObject } from 'cloudflare:workers'
import type { Message } from './types'
import { getColo } from '@/lib/getColo'

export class ChatDurableObject extends DurableObject {
  private messages: Message[] = []

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    ctx.blockConcurrencyWhile(async () => {
      this.messages = (await ctx.storage.get('messages')) ?? []
    })
  }

  /**
   * Get colo info of nearby worker
   */
  colo = getColo

  /**
   * liveness probe
   * @returns 'pong'
   */
  async ping() {
    return 'pong'
  }

  /**
   * Returns the messages array.
   */
  getMessages() {
    return this.messages
  }

  /**
   * Sets a message in the chat store. If a message with the same ID already exists,
   * it updates that message; otherwise, it adds the new message to the store.
   * Returns the index of the message in the messages array.
   */
  setMessage(message: Message): number {
    let index = this.messages.findIndex((m) => m.id === message.id)
    if (index !== -1) {
      this.messages[index] = message
    } else {
      index = this.messages.push(message) - 1
    }
    this.onUpdate()
    return index
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
