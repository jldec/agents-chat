# Multi-user AI Chat with RedwoodSDK RSC and Cloudflare Agents

This is an experimental project, looking at how to live-stream AI responses back to multiple connected clients. All implementations use Cloudflare durable objects and React Server Components (RSC) with [RedwoodSDK](https://rwsdk.com/).

This is a companion repository for a [blog post](https://jldec.me/blog/multi-user-ai-chat-with-redwoodsdk-rsc-and-cloudflare-agents), deployed at https://agents-chat.jldec.me/.

### Implementations
1. **[RSC Chat](https://agents-chat.jldec.me/chat-rsc)** - Uses RedwoodSDK realtime websockets
2. **[OpenAI Chat](https://agents-chat.jldec.me/chat-openai-sdk)** - New! Uses OpenAI Agents SDK and syncs via RedwoodSDK realtime RSC
3. **[Agent Chat](https://agents-chat.jldec.me/chat-agent)** - Uses Cloudflare Agents websockets with separate durable object storage
4. **[Agent SDK Chat](https://agents-chat.jldec.me/chat-agent-sdk)** - Uses Cloudflare Agents AIChatAgent with the useAgentChat hook (based on AI SDK useChat)
5. **[TinyBase Chat](https://agents-chat.jldec.me/chat-tinybase)** - Uses TinyBase websockets
6. **[Agent Agent Chat](https://agents-chat.jldec.me/chat-agent-agent)** - More advanced Cloudflare Agents with subagents and MCP tool calling

### Takeaways
**TL;DR**
- Cloudflare is a great platform for building multi-agent multi-user streaming UX.
- Current UI tooling is not mature, and makes limiting architectural assumptions.

**RedwoodSDK RSC:**
- Server components provide succinct way to populate JSX and keep clients updated.
- This makes using react with Cloudflare workers super easy, and simplifies async data loading.
- The realtime sync feature of RedwoodSDK pushes updates to connected clients over websockets.
- Disabled RSC pre-rendering for components with hooks which can't run server-side.

**Cloudflare Agents**
- Cloudflare durable objects are ideal for agents and subagents.
- The agents library wraps DOs with additional classes and react hookk.
- It depends on Vercel's AI SDK for model portabilty, message types, streaming, and tool calling.
- useChat and useAgentChat result in tight coupling between Agents and UI.
- The design for AI chat assumes single-agent, single-user.
- Support for RSC server-rendering is lacking.

**OpenAI Agents SDK**
- OpenAI Agents SDK is less mature and focuses on model APIs, not UI integration.
- It supports realtime, handoffs, and subagents - not used in this project yet.
- It still requires patches to run in workerd.
- The stateful Agent abstraction assumes long-running server processes.

**TinyBase:**
- DB sync engines can improve UX with local-first client-side persistence.
- The approach requires careful validation since database operations run on the client.
- The architecture assumes that connected clients sync the same data.

### Links
- **Live Demo:** https://agents-chat.jldec.me/
- **Blog Post:** https://jldec.me/blog/multi-user-ai-chat-with-redwoodsdk-rsc-and-cloudflare-agents
- **RedwoodSDK Docs:** https://docs.rwsdk.com/
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Cloudflare Agents Docs:** https://developers.cloudflare.com/agents/
- **OpenAI Agents SDK Docs:** https://openai.github.io/openai-agents-js/