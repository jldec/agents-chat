export function ChatLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h1 className="text-2xl font-bold my-2 px-2">{title}</h1>
      {children}
    </>
  )
}
