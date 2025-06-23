import { Clock } from './Clock'
import { ClientTimeButton } from './ClientTimeButton'
import { ServerTimeButton } from './ServerTimeButton'
import { ServerTime } from './ServerTime'
import { BumpServerButton } from './BumpServerButton'
import { requestInfo } from 'rwsdk/worker'

export function Time() {
  requestInfo.headers.set('cache-control', 'public, max-age=5')
  return (
    <div className="flex flex-col items-center min-h-screen text-sm">
      <h1 className="text-xl font-bold my-2">RedwoodSDK minimal Time Demo</h1>
      <a href="/" className="text-blue-600 p-2 underline mb-8 text-base">
        Home
      </a>
      <Clock />
      <ClientTimeButton />
      <ServerTimeButton callFetch />
      <ServerTimeButton />
      <ServerTime />
      <BumpServerButton />
    </div>
  )
}
