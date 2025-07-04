'use client'

import { useState } from 'react'
import { time } from '@/lib/time'

export function ClientTimeButton() {
  const [val, setVal] = useState('Call time() in client')

  function handleClick() {
    setVal(`ClientTimeButton: ${time()}`)
  }

  return (
    <button
      onClick={handleClick}
      className="border-blue-500 cursor-pointer hover:translate-y-0.5 border-2 m-1 p-2 rounded-md min-w-xs font-mono"
    >
      {val}
    </button>
  )
}
