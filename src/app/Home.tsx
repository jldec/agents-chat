export function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen text-sm">
      <h1 className="text-xl font-bold my-2">RedwoodSDK minimal RSC demo</h1>
      <a href="time" className="text-blue-600 p-2 underline mb-8 text-base">
        Time
      </a>
      <a
        href="https://github.com/jldec/agents-chat#readme"
        className="text-blue-600 p-2 underline mb-8 text-base"
      >
        github.com/jldec/agents-chat
      </a>
    </div>
  )
}
