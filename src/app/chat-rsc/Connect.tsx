'use client'

import { useEffect, useState } from 'react'
import { ping } from './server-functions'

export function Connect() {
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    let retries = 0
    const connect = async () => {
      while (retries++ < 10) {
        try {
          await ping()
          console.log('Connected to server')
          setConnected(true)
          break
        } catch (error) {
          console.log(`Error connecting to server (attempt ${retries}): ${error}`)
          setConnected(false)
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }
    connect()
  }, [])
  return <div className="text-gray-600 text-right px-2">{connected ? 'Connected' : 'Connecting...'}</div>
}
