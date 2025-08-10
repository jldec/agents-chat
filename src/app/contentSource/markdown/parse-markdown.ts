import markdownit from 'markdown-it'
import { Options, imagePlugin } from './image-plugin'
import linksPlugin from 'markdown-it-replace-link'

export function parseMarkdown(s: string, options: Options = {}) {
  const md = markdownit({
    linkify: true,
    html: true
  })
    .use(imagePlugin, options)
    .use(linksPlugin, {
      // for localhost development, remove origin from "own" hrefs
      replaceLink: (link) => link.replace('https://agents-chat.jldec.me', '')
    })

  return md.render(s)
}
