---
title: agents-chat
splashimage: bloem.webp
siteurl: https://agents-chat.jldec.me
description: Multi-user streaming AI chats built using RedwoodSDK RSCs, Cloudflare Agents, Vercel AI SDK, and OpenAI Agents SDK.
twitter: '@jldec'
navlinks:
  - text: Home
    href: /
    icon: home
sociallinks:
  - text: X
    href: https://x.com/jldec
    icon: twitter
  - text: GitHub
    href: https://github.com/jldec/agents-chat
    icon: github
  - text: Linkedin
    href: https://www.linkedin.com/in/jldec/
    icon: linkedin
  - text: Email
    href: mailto:jurgen@jldec.me
    icon: email
---

# Multi-user AI Chat with RedwoodSDK RSC and Cloudflare Agents

This is an experimental project, looking at how to live-stream AI responses back to multiple connected clients. All implementations use Cloudflare durable objects and React Server Components (RSC) with [RedwoodSDK](https://rwsdk.com/).

Deployed at https://agents-chat.jldec.me/

> 1. **[RSC Chat](https://agents-chat.jldec.me/chat-rsc)** - Uses RedwoodSDK realtime websockets
>
> 2. **[OpenAI Chat](https://agents-chat.jldec.me/chat-openai-sdk)** - New! Uses OpenAI Agents SDK
>
> 3. **[Agent Chat](https://agents-chat.jldec.me/chat-agent)** - Uses Cloudflare Agents websockets
>
> 4. **[Agent SDK Chat](https://agents-chat.jldec.me/chat-agent-sdk)** - Uses Cloudflare Agents AIChatAgent
>
> 5. **[TinyBase Chat](https://agents-chat.jldec.me/chat-tinybase)** - Uses TinyBase websockets
>
> 6. **[Agent Agent Chat](https://agents-chat.jldec.me/chat-agent-agent)** - Cloudflare Agents with subagents and MCP tools

Companion repo for blog post: [Multi-user AI chat with RedwoodSDK RSC and Cloudflare agents](https://jldec.me/blog/multi-user-ai-chat-with-redwoodsdk-rsc-and-cloudflare-agents).

### Takeaways
**TL;DR**
- Cloudflare is a great platform for building multi-agent multi-user streaming UX.
- Current UI tooling is immature e.g. with limiting assumptions which block many-to-many connections.

**RedwoodSDK RSC:**
- React Server Components provide succinct way to render JSX on the server.
- RedwoodSDK makes using react with Cloudflare workers easy.
- The realtime feature of RedwoodSDK pushes updates to connected clients over websockets.
- Had to disable ssr for hooks (e.g. useChat) not designed to run server-side.

**Cloudflare Agents**
- Cloudflare durable objects (DOs) are ideal for agents and subagents.
- The agents library wraps DOs with additional classes and react hookk.
- It depends on Vercel's AI SDK for model portabilty, message types, streaming, and tool calling.
- useChat and useAgentChat result in tight coupling between Agents and UI.
- The design for AI chat assumes single-agent, single-user.
- RSC support in Vercel's AI SDK is [limited](https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui).

**OpenAI Agents SDK**
- OpenAI Agents SDK is less mature and focuses on model APIs, not UI integration.
- It offers APIs for realtime, handoffs, and subagents - not used in this project yet.
- It currently requires [patches](https://github.com/jldec/agents-chat/tree/main/patches) to run in workerd. (from [here](https://github.com/cloudflare/agents/tree/main/patches) 🙏 @threepointone)
- The stateful Agent abstraction assumes long-running server processes with a single conversation per agent.

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
