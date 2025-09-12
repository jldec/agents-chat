export function JsonMessage({ message, prefix }: { message: any, prefix?: string }) {
  return (
    <div className="text-sm border border-gray-300 rounded-2xl p-2 ml-10">
      {prefix && <span>{prefix}{': '}</span>}
      {typeof message === 'object' ? JSON.stringify(message, null, 2) : message}
    </div>
  )
}
