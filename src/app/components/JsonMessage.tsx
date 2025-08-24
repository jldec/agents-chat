export function JsonMessage({ message }: any) {
  return (
    <div className="text-sm border border-gray-300 rounded-2xl p-2 ml-10 whitespace-pre">
      {typeof message === 'object' ? JSON.stringify(message, null, 2) : message}
    </div>
  )
}
