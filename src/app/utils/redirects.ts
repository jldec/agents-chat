import { route } from 'rwsdk/router'

export type Redirect = {
  from: string
  to: string
  status?: number
}

export function redirectRoute(r: Redirect) {
  return route(
    r.from,
    async () =>
      new Response(null, {
        status: r.status ?? 302,
        headers: {
          location: r.to
        }
      })
  )
}

export function redirectRoutes(redirects: Redirect[]) {
  return redirects.map(redirectRoute)
}
