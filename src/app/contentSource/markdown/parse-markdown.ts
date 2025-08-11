import markdownit from 'markdown-it'
import linksPlugin from 'markdown-it-replace-link'

export function parseMarkdown(s: string) {
  const md = markdownit({
    linkify: true,
    html: true
  })
    .use(linksPlugin, {
      // for localhost development, remove origin from "own" hrefs
      replaceLink: (link) => link.replace('https://agents-chat.jldec.me', '')
    })

  return md.render(s)
}
