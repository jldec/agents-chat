import { ObserveDOM } from '../utils/ObserveDOM'

interface ChatLayoutProps {
  title: string
  children: React.ReactNode
}

export function ChatLayout({ title, children }: ChatLayoutProps) {
  return (
    <div className="text-sm p-2 relative max-w-2xl mx-auto">
      <a href="/" className="text-blue-600 underline text-base absolute top-0 right-0 pt-4 pr-3">
        Home
      </a>
      <h1 className="text-xl font-bold my-2">{title}</h1>
      <div className="w-full text-left">
        {children}
      </div>
      <ObserveDOM nodeId="message-list" />
    </div>
  )
}
