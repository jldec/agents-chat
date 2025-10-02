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
> 3. **[Agent Chat](https://agents-chat.jldec.me/chat-agent)** - Uses Cloudflare Agents websockets
>
> 7. **[Time](https://agents-chat.jldec.me/time)** - Bonus - My very first foray into RSCs and RedwoodSDK

Companion repo for blog post: [Multi-user AI chat with RedwoodSDK RSC and Cloudflare agents](https://jldec.me/blog/multi-user-ai-chat-with-redwoodsdk-rsc-and-cloudflare-agents).
