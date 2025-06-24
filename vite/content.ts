import { join, basename } from 'path'
import { createReadStream, statSync } from 'fs'
import { ViteDevServer } from 'vite'
import { contentType } from 'mime-types'
import fg from 'fast-glob'

// Vite plugin to serve content from the 'content' directory
// mounts at /content and /content/api/glob for the filename nanifest
// https://ampcode.com/threads/T-fbc1d03a-bcbd-4e14-a967-4af1b6f2e3f2
export default function customContentPlugin() {
  return {
    name: 'vite-plugin-custom-content',
    configureServer(server: ViteDevServer) {
      // Serve static files from the 'content' directory
      const staticPath = join(process.cwd(), 'content')

      server.middlewares.use('/content', async (req, res, next) => {
        if (!req.url) return next()

        // Convert to web standard URL to get clean pathname
        const url = new URL(req.url, 'http://localhost')

        // Handle glob API endpoint
        if (url.pathname === '/api/glob') {
          try {
            const globPath = join(staticPath, '/**/*')
            const files = (await fg.glob(globPath)).map((file) => file.slice(staticPath.length))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(files))
            return
          } catch (err) {
            console.error(err)
            next()
          }
        }

        const filePath = join(staticPath, url.pathname)

        try {
          const stat = statSync(filePath)
          if (stat.isFile()) {
            const mimeType = contentType(basename(filePath)) || 'application/octet-stream'
            res.setHeader('Content-Type', mimeType)
            res.setHeader('Content-Length', stat.size.toString())

            const stream = createReadStream(filePath)
            stream.pipe(res)
          } else {
            next()
          }
        } catch (err) {
          console.error(err)
          next()
        }
      })
    }
  }
}
