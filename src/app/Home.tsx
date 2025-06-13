export function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen text-sm">
      <h1 className="text-xl font-bold my-2">RedwoodSDK minimal RSC demo</h1>
      <div className="flex flex-row gap-2">
        <a href="chat-rsc" className="text-blue-600 p-2 underline mb-8 text-base">
          RSC Chat
        </a>
        <a href="chat-agent" className="text-blue-600 p-2 underline mb-8 text-base">
          Agent Chat
        </a>
        <a href="chat-agent-sdk" className="text-blue-600 p-2 underline mb-8 text-base">
          Agent SDK Chat
        </a>
        <a href="chat-tinybase" className="text-blue-600 p-2 underline mb-8 text-base">
          TinyBase Chat
        </a>
      </div>
      <div className="flex flex-row gap-2">
        <a href="https://github.com/jldec/agents-chat#readme" className="text-blue-600 p-2 underline mb-8 text-base">
          github.com/jldec/agents-chat
        </a>
        <a href="time" className="text-blue-600 p-2 underline mb-8 text-base">
          ⏰
        </a>
      </div>
    </div>
  )
}
