import { MessageList } from './MessageList'
import { MessageInput } from './MesssageInput'

export function Chat() {
  console.log('Chat RSC')
  return (
    <div className="flex flex-col items-center min-h-screen text-sm max-w-xl m-auto p-2">
      <h1 className="text-xl font-bold my-2">RedwoodSDK Agents Chat</h1>
      <a href="/" className="text-blue-600 p-2 underline mb-8 text-base">
        Home
      </a>
      <div className="w-full text-left">
        <MessageList />
        <MessageInput />
      </div>
    </div>
  )
}
