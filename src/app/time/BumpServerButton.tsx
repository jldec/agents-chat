'use client'

import { useState } from 'react'

export function BumpServerButton() {
  const [val, setVal] = useState('Cross-client realtime update')

  async function handleClick() {
    const res = await fetch('/api/bump')
    const text = await res.text()
    setVal(`fetch /api/bump: ${text}`)
  }

  return (
    <button
      onClick={handleClick}
      className="border-gray-300 cursor-pointer hover:translate-y-0.5 border-2 m-1 p-2 rounded-md min-w-xs font-mono"
    >
      {val}
    </button>
  )
}
