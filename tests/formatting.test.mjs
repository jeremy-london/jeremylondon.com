import { describe, expect, it } from 'vitest'

import { checkImageUrl, getFormattedDate } from '../src/utils/all.js'
import { getReadingTimeDetails } from '../src/utils/reading-time.js'
import { slugifyTag, titleizeTag } from '../src/utils/tags.ts'

describe('formatting helpers', () => {
  it('slugifies and titleizes tags consistently', () => {
    expect(slugifyTag('  AI & Systems / Ops  ')).toBe('ai-and-systems-ops')
    expect(titleizeTag('ai-systems quality')).toBe('Ai Systems Quality')
  })

  it('floors reading time to three minutes', () => {
    expect(getReadingTimeDetails('short text').readingTimeMinutes).toBe(3)
  })

  it('formats dates and resolves image URLs', () => {
    expect(getFormattedDate('2026-07-12T12:00:00.000Z')).toBe('Jul 12, 2026')
    expect(getFormattedDate('')).toBe('')
    expect(checkImageUrl('/images/test.png', 'https://example.com/blog/post/')).toBe(
      'https://example.com/images/test.png',
    )
    expect(checkImageUrl('https://cdn.example.com/test.png', 'https://example.com/')).toBe(
      'https://cdn.example.com/test.png',
    )
  })
})
