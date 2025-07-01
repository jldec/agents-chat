// import { getPagePaths } from './markdown/get-dirs'
// import { getManifest } from './manifest'
// import { getPageData } from './markdown/get-markdown'
// import { getImage } from './images'
// // import { contentApiRoutes } from './routes'
// import { getStatic } from './static'
// import { getRedirects } from './redirects'


// app.route('/api', api)

// // serve rewritten markdown image links (deprecated)
// app.get('/img/:image{.+$}', async (c) => {
//   const image = c.req.param('image')
//   return await getImage(image, c)
// })

// // serve rendered markdown pages and same-origin static content from manifest
// // fall through if not found
// app.use(async (c, next) => {
//   const noCache = c.req.header('Cache-Control') === 'no-cache'
//   const path = c.req.path // includes leading /
//   if (path.endsWith('/') && path.length > 1) {
//     return c.redirect(path.slice(0, -1))
//   }
//   const isHome = path === '/'
//   if (c.req.method !== 'GET' || path.startsWith('/parties')) {
//     return await next()
//   }

//   // This should be the only place we force reloading the tree from source
//   let manifest = await getManifest(noCache && isHome)
//   if (manifest.includes(path)) {
//     const resp = await getStatic(path, noCache)
//     if (resp) return resp
//   }

//   // TODO: extract "render" worker for theming and css
//   let pagePaths = await getPagePaths()
//   if (path in pagePaths) {
//     const page = await getPageData(path, noCache)
//     if (page) {
//       // site is used for meta headers, dirEntry is only used for "next" links on blog pages
//       const site = (await getPageData('/', ))?.attrs
//       const dirEntry = path.startsWith('/blog/')
//         ? (await getPageData('/blog', ))?.dir?.find((p) => p.path === path)
//         : undefined
//       const resp = c.render('', { page, site, dirEntry })
//       c.res.headers.set('cache-control', 'public, max-age=600')
//       return resp
//     }
//   }

//   let redirects = await getRedirects()
//   if (path in redirects) {
//     return c.redirect(redirects[path].redirect, redirects[path].status)
//   }

//   await next()
// })

// app.notFound((c) => {
//   c.status(404)
//   return c.render(
//     <>
//       <h1>Sorry, can't find that.</h1>
//       <p>{c.req.url}</p>
//       <p>
//         <a href="/">Home</a>
//       </p>
//     </>,
//     {}
//   )
// })

// app.onError((err, c) => {
//   c.status(404)
//   return c.render(
//     <>
//       <h1>Oops 😬</h1>
//       <pre>{err.stack ?? err.message}</pre>
//       <p>
//         <a href="/">Home</a>
//       </p>
//     </>,
//     {}
//   )
// })

// export default app
