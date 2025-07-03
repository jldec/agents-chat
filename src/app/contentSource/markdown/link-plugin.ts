// from https://github.com/vuejs/vitepress/tree/256d742/src/node/markdown/plugins
// markdown-it plugin for rewriting link src urls
// TODO: configurable prefix for link urls

import type MarkdownIt from 'markdown-it'

export const linkPlugin = (md: MarkdownIt) => {
  const linkRule = md.renderer.rules.link!
  md.renderer.rules.link = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    let url = token.attrGet('href')
    if (url) {
      token.attrSet('href', rewriteUrl(url))
    }
    return linkRule(tokens, idx, options, env, self)
  }
}

function rewriteUrl(url: string) {
  // console.log('linkPlugin')
  return url
}
