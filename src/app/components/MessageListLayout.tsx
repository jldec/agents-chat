export function MessageListLayout({ children, depth = 0 }: { children: React.ReactNode; depth?: number }) {
  return (
    <div
      id="message-list"
      className={'flex flex-col gap-2 prose max-w-none prose-p:!my-0' + (depth > 0 ? ' ml-10 mb-6' : '')}
    >
      {children}
    </div>
  )
}
