import markdownit from 'markdown-it'
import { Options, imagePlugin } from './image-plugin'

export function parseMarkdown(s: string, options: Options = {}) {
  const md = markdownit({
    linkify: true,
    html: true
  }).use(imagePlugin, options)

  return md.render(s)
}
