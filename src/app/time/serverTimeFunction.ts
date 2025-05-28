'use server'
import { time } from './utils'

export async function serverTime() {
  return time()
}
