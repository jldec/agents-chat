import { AIChatAgent } from "agents/ai-chat-agent";
import { askAI } from '@/lib/askAI'

export class ChatAgentDurableObject extends AIChatAgent<Env> {
  async onChatMessage() {
    const stream = await askAI(this.messages);
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" }
    });
  }
}
