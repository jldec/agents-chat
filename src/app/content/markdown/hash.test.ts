import { describe, it, expect } from 'vitest'
import { hash } from './hash'

const url = 'https://example.com/image.png'
const url2 = 'https://example2.com/image.png'

describe('hash', () => {
  it('should generate a consistent hash for the same url', async () => {
    const hash1 = hash(url)
    const hash2 = hash(url)
    expect(hash1).toBe(hash2)
  })

  it('should generate different hashes for different urls', async () => {
    const hash1 = hash(url)
    const hash2 = hash(url2)
    expect(hash1).not.toBe(hash2)
  })

  it('should generate a FNV 1a hash', async () => {
    const hash1 = hash(url)
    expect(hash1).toBe('1xzq9lwjinar8')
  })
})
