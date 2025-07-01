import { Redirect } from './types'
import { getManifest } from './manifest'
import { getStatic } from './static'

const redirectsFile = '/_redirects'

let redirectsMemo: null | Record<string, Redirect> = null

export function zapRedirectCache() {
  redirectsMemo = null
}

export async function getRedirects() {
  let redirects: Record<string, Redirect> = {}

  if (redirectsMemo) return redirectsMemo

  const manifest = await getManifest()
  if (!manifest.includes(redirectsFile)) return (redirectsMemo = {})

  const response = await getStatic(redirectsFile)
  if (!response || !response.ok) return (redirectsMemo = {})

  const redirectsList = (await response.text())
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter((line) => line.length >= 2)

  for (const [path, redirect, status] of redirectsList) {
    redirects[path] = { redirect, status: parseInt(status) || undefined }
  }

  return (redirectsMemo = redirects)
}
