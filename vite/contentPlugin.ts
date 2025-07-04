import { join, basename } from 'node:path'
import { createReadStream, statSync } from 'node:fs'
import { ViteDevServer } from 'vite'
import { contentType } from 'mime-types'
import fg from 'fast-glob'
import dotenv from 'dotenv'

// Plugin options interface
export interface ContentPluginOptions {
  contentDir?: string
}

// Vite plugin - dev only
// serves files from the content directory mounted on /_content
export function contentPlugin(options: ContentPluginOptions = {}) {
  return {
    name: 'vite-plugin-custom-content',
    configureServer(server: ViteDevServer) {
      dotenv.config({ path: '.dev.vars' })
      const contentDir = process.env.DEV_CONTENT_DIR || options.contentDir || join(process.cwd(), 'content')
      const contentRoute = '/_content'
      console.log('Serving content from', contentDir, 'on', contentRoute)

      server.middlewares.use(contentRoute, async (req, res, next) => {
        if (!req.url) return next()
        const url = new URL(req.url, 'http://localhost')
        if (url.pathname === '/') {
          try {
            const globPath = join(contentDir, '/**/*')
            const files = (await fg.glob(globPath)).map((file) => file.slice(contentDir.length))
            res.setHeader('Content-Type', 'application/json')
            console.log(`content manifest ${files.length} files`)
            res.end(JSON.stringify(files))
            return
          } catch (err) {
            console.error(err)
            return next()
          }
        }
        const filePath = join(contentDir, url.pathname)
        try {
          const stat = statSync(filePath)
          if (stat.isFile()) {
            const mimeType = contentType(basename(filePath)) || 'application/octet-stream'
            res.setHeader('Content-Type', mimeType)
            res.setHeader('Content-Length', stat.size.toString())

            const stream = createReadStream(filePath)
            stream.pipe(res)
            console.log(filePath, res.statusCode, stat.size)
          } else {
            console.log(filePath, 403)
            res.statusCode = 403
            res.end('Forbidden')
          }
        } catch (err) {
          console.log(filePath, 404)
          res.statusCode = 404
          res.end('Not found')
        }
      })
    }
  }
}
