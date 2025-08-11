import markdownit from 'markdown-it'

export function parseMarkdown(s: string) {
  const md = markdownit({
    linkify: true,
    html: true
  })

  return md.render(s)
}
