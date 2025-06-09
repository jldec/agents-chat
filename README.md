# Multi-user AI chat with RedwoodSDK RSC and Cloudflare agents

Three implementations of multi-user streaming AI chat -- deployed at https://agents-chat.jldec.workers.dev/.

### [RSC Chat](https://agents-chat.jldec.workers.dev/chat-rsc)

Uses realtime websocket-based RSC updates implemented by [RedwoodSDK](https://rwsdk.com/). (actual code)

![RSC-code](https://github.com/user-attachments/assets/13de3b96-2ad4-49ba-bed5-d03dd24d8248)

### [Agent Chat](https://agents-chat.jldec.workers.dev/chat-agent)

Sends JSON over websockets implemented by Cloudflare [agents](https://developers.cloudflare.com/agents/). (code simplified for readability)

<img width="1107" alt="client-code" src="https://github.com/user-attachments/assets/8aac02b7-d820-445e-9a90-d78924928a0d" />

### [TinyBase Chat](https://agents-chat.jldec.workers.dev/chat-tinybase)

Persists the same store on each client and in durable objects.

![Screenshot 2025-06-08 at 20 55 06](https://github.com/user-attachments/assets/e5b59276-6f03-4259-adf4-84ae2ed78ca7)

## First impressions
- All three implementations rely on Cloudflare durable objects with websockets. This is great for runtime performance and makes deployment easy. There are no containers to build or servers to manage.
- React is great for a use case like this where updates are coming from both the server and the client. All three implementation above, use the same MessageList component.

#### RedwoodSK realtime RSC
- Server components are a succinct way to pre-populate JSX with data and then keep clients up to date.
- It's nice to be able to use async data loading inline on the server. Rendering with data from remote storage during streaming can be slower unless loading is memoized.
- The scope of the RSC update payload sent to clients may become a problem during streaming, e.g. for pages with a lot of data. Discussion about this in the [rwsdk discord](https://discord.com/channels/679514959968993311/1374715298636238968/1376288266789064734).
- Server functions are convenient, but should be used with care since they generate HTTP APIs which is where auth/authz is commonly required.

#### Cloudflare Agents websockets
- Using Cloudflare Agents websockets means that we have full control over the payloads. This allows for nice optimizations e.g. to send partial data during streaming.
- Rendering chat history on the client via fetch or via websocket makes the initial UX a little janky. (TODO: investigate pre-rendering)
- Agents can combine both the chat storage and the websocket in one durable object. (TODO: please do this)

#### TinyBase sync
- Synchronization is happening between memory and persistance on every node, and between nodes.
- This improves the UX once data is persisted on the client but it does feel a little complex to setup a.t.m.
- Since store operations run on the client we have to be extra careful with validation e.g. to deal with  clients being compromized.
- Localstorage persistence has an [issue](https://github.com/jldec/agents-chat/issues/13) with multiple tabs.

## Why?

I'm exploring how to build multi-user AI chat because I expect this to become the universal UI for humans and agents to work together.
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
