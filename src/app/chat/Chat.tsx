import { MessageList } from './MessageList'
import { MessageInput } from './MesssageInput'

export function Chat() {
  console.log('Chat RSC')
  return (
    <div className="text-sm p-2 relative max-w-2xl mx-auto">
      <a href="/" className="text-blue-600 underline text-base absolute top-0 right-0 pt-4 pr-3">
        Home
      </a>
      <h1 className="text-xl font-bold my-2">RedwoodSDK RSC Chat</h1>
      <div className="w-full text-left">
        <MessageList />
        <MessageInput />
      </div>
    </div>
  )
}
