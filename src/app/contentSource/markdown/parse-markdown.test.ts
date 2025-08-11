import { expect, test } from 'vitest'
import { parseMarkdown } from './parse-markdown'

const markdown = `# markdown header
paragraph 1

[on-site-anchor](https://agents-chat.jldec.me/some-link)
`

const expectedResult = `<h1>markdown header</h1>
<p>paragraph 1</p>
<p><a href="/some-link">on-site-anchor</a></p>
`

test('parseMarkdown', {}, () => {
  let actual = parseMarkdown(markdown)
  // console.log(actual)
  expect(actual).toEqual(expectedResult)
})
