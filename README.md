# Multi-user AI Chat with RedwoodSDK RSC and Cloudflare Agents

This is an experimental project, looking at how to live-stream AI responses back to multiple connected clients. All implementations use Cloudflare durable objects and React Server Components (RSC) with [RedwoodSDK](https://rwsdk.com/).

This is a companion repository for a [blog post](https://jldec.me/blog/multi-user-ai-chat-with-redwoodsdk-rsc-and-cloudflare-agents), deployed at https://agents-chat.jldec.me/.

### Implementations
1. **[RSC Chat](https://agents-chat.jldec.me/chat-rsc)** - Uses RedwoodSDK realtime websockets
2. **[Agent Chat](https://agents-chat.jldec.me/chat-agent)** - Uses Cloudflare Agents websockets with separate durable object storage
3. **[Agent SDK Chat](https://agents-chat.jldec.me/chat-agent-sdk)** - Uses Cloudflare Agents AIChatAgent with the useAgentChat hook
4. **[TinyBase Chat](https://agents-chat.jldec.me/chat-tinybase)** - Uses TinyBase websockets
5. **[Agent Agent Chat](https://agents-chat.jldec.me/chat-agent-agent)** - Advanced Cloudflare agent with subagents and MCP tool calling

### Takeaways

**RedwoodSDK RSC:**
- Server components provide succinct way to populate JSX and keep clients updated.
- This makes using react with Cloudflare workers super easy, and simplifies async data loading.
- The realtime sync feature of RedwoodSDK pushes updates to connected clients over websockets.

**Cloudflare Agents:**
- AIChatAgent provides its own websocket protocol for multi-user real-time sync
- Agents also offer raw websockets give full control over payloads for optimizations
- Vercel's AI SDK abstracts tool calling and supports different LLMs

**TinyBase:**
- DB sync engines can improve UX with local-first client-side persistence
- The approach requires careful validation since database operations run on the client

### Links
- **Live Demo:** https://agents-chat.jldec.me/
- **Blog Post:** https://jldec.me/blog/multi-user-ai-chat-with-redwoodsdk-rsc-and-cloudflare-agents
- **RedwoodSDK Docs:** https://docs.rwsdk.com/
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Cloudflare Agents Docs:** https://developers.cloudflare.com/agents/
