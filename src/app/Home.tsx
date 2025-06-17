export function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen text-sm">
      <h1 className="text-xl font-bold my-2">RedwoodSDK Agent Chat demo</h1>
      <div className="flex flex-row justify-center flex-wrap gap-2 max-w-xl">
        <a href="chat-rsc" className="text-blue-600 p-2 hover:underline text-base text-center border-gray-200 border-1 shadow-md rounded-md">
          RSC Chat
        </a>
        <a href="chat-agent" className="text-blue-600 p-2 hover:underline text-base text-center border-gray-200 border-1 shadow-md rounded-md">
          Agent Chat
        </a>
        <a href="chat-agent-sdk" className="text-blue-600 p-2 hover:underline text-base text-center border-gray-200 border-1 shadow-md rounded-md">
          Agent SDK Chat
        </a>
        <a href="chat-tinybase" className="text-blue-600 p-2 hover:underline text-base text-center border-gray-200 border-1 shadow-md rounded-md">
          TinyBase Chat
        </a>
        <a href="chat-agent-agent" className="text-blue-600 p-2 hover:underline text-base text-center border-gray-200 border-1 shadow-md rounded-md">
          Agent Agent Chat
        </a>
      </div>
      <div className="flex flex-row justify-center gap-2 mt-4">
        <a href="https://github.com/jldec/agents-chat#readme" className="text-blue-600 p-2 underline text-base">
          github.com/jldec/agents-chat
        </a>
      </div>
      <div className="flex flex-row justify-center gap-2">
        <a href="time" className="text-blue-600 p-2 underline text-base">
          ⏰
        </a>
      </div>
    </div>
  )
}
