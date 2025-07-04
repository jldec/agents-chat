import type { PageData } from '../types'
import { parseFrontmatter } from './parse-frontmatter'
import { parseMarkdown } from './parse-markdown'
import { getDirData, getDirs } from './get-dirs'
import { IS_DEV } from 'rwsdk/constants'
import { env } from 'cloudflare:workers'
import { requestInfo } from 'rwsdk/worker'

// memoize to speed up homeContent().attrs for Nav
let homePage: PageData | null = null

async function filePath(path: string): Promise<string> {
  let dirs = await getDirs()
  if (path in dirs) {
    path += (path === '/' ? '' : '/') + 'index'
  }
  return `${path}.md`
}

async function getSourceText(path: string): Promise<string | null> {
  const filepath = await filePath(path)
  let resp: Response
  let source = 'github'
  if (IS_DEV && !env.GH_TEST) {
    const origin = new URL(requestInfo.request.url).origin
    source = `${origin}/_content`
    resp = await fetch(`${source}${filepath}`)
  } else {
    // https://docs.github.com/en/rest/repos/contents
    resp = await fetch(
      `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${env.GH_PATH}${filepath}?ref=${env.GH_BRANCH}`,
      {
        headers: {
          Accept: 'application/vnd.github.raw+json',
          Authorization: `Bearer ${env.GH_PAT}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'agents-chat-worker'
        }
      }
    )
  }
  console.log('getMarkdown', source, resp.status)
  if (!resp.ok) return null
  return await resp.text()
}

// Return unstyled HTML content for a page
// Fetches and parses markdown from source, if not cached.
export async function getPageData(path: string, noCache: boolean = false): Promise<PageData | null> {
  const isHome = path === '/'

  if (!noCache) {
    if (isHome && homePage) return homePage
    const cachedContent = await env.PAGEDATA_CACHE.get(path)
    if (cachedContent !== null) return JSON.parse(cachedContent) as PageData
  }

  const sourceText = await getSourceText(path)
  if (!sourceText) return null
  const parsedFrontmatter = parseFrontmatter(sourceText)
  const dirData = await getDirData(path, parsedFrontmatter.attrs.sortby)
  const pageData = {
    path,
    attrs: parsedFrontmatter.attrs,
    md: parsedFrontmatter.body,
    html: parsedFrontmatter.attrs.error
      ? errorHtml(parsedFrontmatter.attrs.error, await filePath(path))
      : parseMarkdown(parsedFrontmatter.body, {
          hashPrefix: env.IMAGE_KEY
        }),
    dir: dirData
  }
  requestInfo.cf.waitUntil(env.PAGEDATA_CACHE.put(path, JSON.stringify(pageData)))
  if (isHome) {
    homePage = pageData
  }
  return pageData
}

function errorHtml(error: unknown, path: string) {
  return `<pre>${escapeHtml(path)}\n${escapeHtml('' + error)}</pre>`
}

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
}
