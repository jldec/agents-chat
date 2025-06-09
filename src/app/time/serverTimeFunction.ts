'use server'
import { time } from '@/lib/time'

export async function serverTime() {
  return time()
}
