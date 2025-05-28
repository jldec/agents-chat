'use client'

import { useState } from 'react'
import { serverTime } from './serverTimeFunction'

export function ServerTimeButton({ callFetch = false }) {
  const label = callFetch ? 'fetch /api/time' : 'Call serverTime() server function'
  const [val, setVal] = useState(label)

  async function handleClick() {
    if (callFetch) {
      const res = await fetch('/api/time')
      const text = await res.text()
      setVal(`fetch /api/time: ${text}`)
    } else {
      setVal(`serverTime(): ${await serverTime()}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="border-amber-500 cursor-pointer hover:translate-y-0.5 border-2 m-1 p-2 rounded-md min-w-xs font-mono"
    >
      {val}
    </button>
  )
}
