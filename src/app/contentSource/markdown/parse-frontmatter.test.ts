import { expect, test } from 'vitest'
import { parseFrontmatter } from './parse-frontmatter'

const frontMatter = `foo: bar
baz: 1
array: [1, 2, 3]
nested:
  inner: yo
date: 2022-11-01`

const body = `# markdown header
paragraphs`

const content = `---
${frontMatter}
---
${body}`

const attrs = {
  foo: 'bar',
  baz: 1,
  array: [1, 2, 3],
  nested: {
    inner: 'yo'
  },
  date: '2022-11-01'
}

const expectedResult = {
  frontMatter,
  body,
  attrs
}

test('parseFrontmatter', {}, () => {
  expect(parseFrontmatter(content)).toEqual(expectedResult)
})

const noFrontmatter = `# no frontmatter here
yo`

const expectedResultNoFrontMatter = {
  frontMatter: '',
  body: noFrontmatter,
  attrs: {}
}

test('parseFrontmatter undefined when no frontMatter', {}, () => {
  expect(parseFrontmatter(noFrontmatter)).toEqual(expectedResultNoFrontMatter)
})
