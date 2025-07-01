import { test } from '@std/front-matter/test'
import { extract } from '@std/front-matter/unstable-yaml'
import type { Frontmatter } from '../types'

export function parseFrontmatter(s: string) {
  if (!test(s))
    return {
      frontMatter: '',
      body: s,
      attrs: {} as Frontmatter
    }

  try {
    return extract<Frontmatter>(s, { schema: "json" })
  } catch (error) {
    return {
      frontMatter: '',
      body: s,
      attrs: { error }
    }
  }
}
