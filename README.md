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

## Implementation Approaches

Each approach demonstrates different strategies for handling multi-user AI chat streaming:

### 1. [RSC Chat](https://agents-chat.jldec.me/chat-rsc) - RedwoodSDK Realtime
**Architecture:** React Server Components + Durable Objects + RedwoodSDK Websockets
- **Streaming Method:** Server-side streaming with automatic UI updates via RedwoodSDK's realtime websockets
- **Multi-user Support:** All connected clients receive real-time updates as AI responses stream in
- **Key Features:** 
  - JSX rendered server-side and pushed to clients
  - Built-in websocket management with automatic reconnection
  - Minimal client-side JavaScript required
- **Best For:** Applications that prefer server-rendered UI updates and want minimal client complexity

### 2. [OpenAI Chat](https://agents-chat.jldec.me/chat-openai-sdk) - OpenAI Agents SDK
**Architecture:** OpenAI Agents SDK + Durable Objects + Custom Websockets
- **Streaming Method:** OpenAI's native streaming API with custom websocket distribution
- **Multi-user Support:** Server-side fan-out to multiple websocket connections per chat room
- **Key Features:**
  - Direct integration with OpenAI's latest Agents SDK
  - Stateful agent conversations with thread management
  - Requires custom patches for workerd compatibility
- **Best For:** Applications wanting cutting-edge OpenAI features and willing to handle SDK complexity

### 3. [Agent Chat](https://agents-chat.jldec.me/chat-agent) - Cloudflare Agents Basic
**Architecture:** Cloudflare Agents + Vercel AI SDK + Custom Websockets
- **Streaming Method:** AI SDK's streaming responses broadcast via websockets to multiple clients
- **Multi-user Support:** Durable Object manages room state and distributes messages to all connected users
- **Key Features:**
  - Simple websocket-based real-time communication
  - Integration with Vercel AI SDK for model portability
  - Clean separation between AI logic and connection management
- **Best For:** Straightforward multi-user chat with flexible model support

### 4. [Agent SDK Chat](https://agents-chat.jldec.me/chat-agent-sdk) - Cloudflare AIChatAgent
**Architecture:** Cloudflare Agents AIChatAgent + Built-in Multi-user Support
- **Streaming Method:** AIChatAgent handles streaming and automatically distributes to connected clients
- **Multi-user Support:** Built-in room management and client broadcasting
- **Key Features:**
  - Minimal setup - AIChatAgent handles most complexity
  - Automatic client management and message distribution
  - Tight integration with Cloudflare's agent ecosystem
- **Best For:** Rapid prototyping and applications that want minimal custom code

### 5. [TinyBase Chat](https://agents-chat.jldec.me/chat-tinybase) - Client-side Sync
**Architecture:** TinyBase + Durable Objects + Local-first Persistence
- **Streaming Method:** AI responses written to shared TinyBase store, synced to all clients in real-time
- **Multi-user Support:** Database synchronization ensures all clients see the same chat state
- **Key Features:**
  - Local-first architecture with offline support
  - Automatic conflict resolution and data synchronization
  - Client-side persistence and caching
  - Requires careful validation since DB operations run client-side
- **Best For:** Apps requiring offline functionality and local-first user experience

### 6. [Agent Agent Chat](https://agents-chat.jldec.me/chat-agent-agent) - Multi-Agent with Tools
**Architecture:** Cloudflare Agents + Subagents + MCP Tools + Websockets
- **Streaming Method:** Main agent coordinates subagents, streams responses from multiple AI models
- **Multi-user Support:** Complex orchestration between multiple agents serving multiple users
- **Key Features:**
  - Hierarchical agent system with specialized subagents
  - Integration with Model Context Protocol (MCP) tools
  - Advanced AI workflows with agent handoffs
  - Real-time coordination between multiple AI models
- **Best For:** Complex AI applications requiring specialized agents and advanced tooling

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

[Test broken link](broken-link)