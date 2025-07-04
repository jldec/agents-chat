# Multi-user AI chat with RedwoodSDK RSC and Cloudflare agents
_Companion-repo for [blog post](https://jldec.me/blog/multi-user-ai-chat-with-redwoodsdk-rsc-and-cloudflare-agents) on jldec.me._

Several implementations of multi-user streaming AI chat -- deployed at https://agents-chat.jldec.workers.dev/

- [RSC Chat](https://agents-chat.jldec.workers.dev/chat-rsc) - syncs via [RedwoodSDK realtime websockets](https://docs.rwsdk.com/core/realtime/) - stores messages in a separate durable object.
- [Agent Chat](https://agents-chat.jldec.workers.dev/chat-agent) - syncs via [Cloudflare Agents websockets](https://developers.cloudflare.com/agents/api-reference/websockets/) - stores messages in a separate durable object.
- [Agent SDK Chat](https://agents-chat.jldec.workers.dev/chat-agent-sdk) - uses [AIChatAgent](https://developers.cloudflare.com/agents/api-reference/agents-api/#aichatagent) with the [useAgentChat](https://developers.cloudflare.com/agents/api-reference/agents-api/#chat-agent-react-api) hook - stores messages in the same (per agent intance) durable object.
- [TinyBase Chat](https://agents-chat.jldec.workers.dev/chat-tinybase) - syncs via [TinyBase websockets](https://tinybase.org/)
- [Agent Agent Chat](https://agents-chat.jldec.workers.dev/chat-agent-agent) - More advanced Cloudflare agent with subagents and MCP tool calling (sse only, no auth). Syncs via agent websocket.

## First impressions
- RedwoodSDK (RSCs on Cloudflare workers) is very interesting. The addition of [client-side navigation](https://docs.rwsdk.com/guides/frontend/client-side-nav/) (SPA mode) together with Cloudflare cache integration, will make this stack hard to beat.
- I was a bit surprised to learn that RSC servers render `use client` components on initial load. This produced errors running the `useChatAgent()` hook from the agents sdk. The rwsdk team was super-responsive helping to debug the issue, and provided a solution to [disable ssr](https://docs.rwsdk.com/reference/sdk-router/#options). More details in [this PR](https://github.com/jldec/agents-chat/pull/20).
- All implementations rely on Cloudflare [durable objects](https://developers.cloudflare.com/durable-objects/#what-are-durable-objects) with websockets. This is great for runtime performance and makes deployment easy. There are no containers to build or servers to manage.
- React is great for a use case like this where updates are coming from both the server and the client. All implementations use the same [MessageList](src/app/shared/MessageList.tsx) component.

#### RedwoodSK realtime RSC
- Server components are a [succinct](https://github.com/jldec/agents-chat/blob/main/src/app/chat-rsc/ChatRSC.tsx) way to pre-populate JSX with data and then keep clients up to date.
- It's nice to be able to use async data loading inline on the server. Rendering with data from remote storage during streaming can be slower unless data is memoized.
- The scope of the RSC update payload sent to clients may become a problem during streaming, e.g. for pages with a lot of data. Discussion about this in the [rwsdk discord](https://discord.com/channels/679514959968993311/1374715298636238968/1376288266789064734).
- Server functions are convenient, but should be used with care since they generate HTTP APIs which is where auth/authz is commonly required. See [this take](https://www.youtube.com/watch?v=yD-KK4hiULU) from Jack Herrington for more.

#### Cloudflare Agents raw websockets
- Using Cloudflare Agents raw websockets gives us [full control](https://github.com/jldec/agents-chat/blob/main/src/app/chat-agent/WebsocketAgent.ts) over the payloads. This allows for nice optimizations e.g. to send partial data during streaming.
- Rendering chat history on the client via fetch or via websocket makes the initial UX a little janky. (TODO: investigate pre-rendering)

#### Cloudflare Agents SDK with AIChatAgent
- [AIChatAgent](https://developers.cloudflare.com/agents/api-reference/agents-api/#aichatagent) handles multi-user real-time message sync over websockets. This simplifies the implementation.
- The SDK abstracts tool calling and supports different LLMs with Vercel's [AI SDK](https://ai-sdk.dev/docs/introduction).
- [useAgentChat](https://developers.cloudflare.com/agents/api-reference/agents-api/#chat-agent-react-api) which calls AI SDK's [useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat#usechat), manages chat UI interactions with react, however only a single client sees the AI streaming reponse (see [#23](https://github.com/jldec/agents-chat/issues/23)).

#### Agent Agent with subagents and MCP tools
- MCP tools can be added, removed or listed.
- A built-in tool calls [AIChatAgent.saveMessages()](https://github.com/cloudflare/agents/blob/398c7f5411f3a63f450007f83db7e3f29b6ed4c2/packages/agents/src/ai-chat-agent.ts#L185) on a named subagent, passing in a new message, as if it were coming from a user.
- This makes it possible for the main agent to prompt the subagent.
- There are also built-in tools for clearing and listing messages.
- Subagent responses currently don't stream (TODO)

#### TinyBase sync
- Synchronization is happening between memory and persistance on every node, and between nodes.
- This improves the UX once data is persisted on the client and makes it easy to use React hooks listening for database updates.
- The APIs for [persistence and synchronization](https://github.com/jldec/agents-chat/blob/main/src/app/chat-tinybase/store.ts#L14-L38) feel like they could be consolidated.
- Since store operations run on the client we have to be extra careful with validation e.g. to deal with  clients being compromized.

## Why?

I'm exploring how to build multi-user AI chat because I expect this to become the universal UI for humans and agents to work together.

Here are just a few of the challenges:

- Live-streaming AI responses back to multiple connected clients
- Subagent creation, lifecycle, identity, sub-threads, approvals
- Conversation persistence, re-use, summaries
- Tool discovery, selective use, approval flow
- User identity, auth, authz
- Long running tasks
- Notifications

The idea to try 3 architectures came from the same [rwsdk discord](https://discord.com/channels/679514959968993311/1374715298636238968/1376269189802627112) thread.

> ![Screenshot 2025-06-02 at 21 06 37](https://github.com/user-attachments/assets/2545674b-1535-4759-b332-151014bc12ea)
>
> #### The must-have requirements are,
>
> 1. load up to one full page size of recent messages on client start,
> 2. live-stream new messages (e.g. AI responses) to all active clients.,
> 3. return older messages only when requested by a specific client.,
>
> ### Architectural choices:
>
> #### 1. custom JSON over websockets,
>
> Instead of using the rwsdk realtime feature, send messages (and message chunks when streaming) via JSON over websockets like cloudflare/agents. One way to build this would be with the useAgentChat react hook from the same library. Rendering happens client-side.
>
> #### 2. RSCs with rwsdk and realtime,
>
> Use rwsdk with server components for realtime updates to send the first page of messages and keep it updated as it changes. Call a separate api route (or server-function) to fetch earlier messages when needed. This solution will be more chatty (1 page of messages on the wire for each realtime update), but probably ok. There is also some complexity (I haven't tried yet) to blend RSCs with the earlier messages, but I think it's doable with some experimentation.
>
> #### 3. sync data,
>
> Use a generic sync engine like tinybase to sync state between the durable objects and browsers, and render messages on the client This has the benefit of built-in support for client-persistence (local caching) and also syncs just one value at a time (not the whole page like rwsdk), but it adds some complexity and some constraints to how things are represented on the server side.
>
> all 3 options use react, websockets, and durable objects 🙂

### Further Reading

- [RedwoodSDK Docs](https://docs.rwsdk.com/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Agents Docs](https://developers.cloudflare.com/agents/)
