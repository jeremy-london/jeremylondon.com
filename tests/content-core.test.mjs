import { describe, expect, it, vi } from 'vitest'

import {
  cleanMDXContent,
  sortLatestPosts,
} from '../src/utils/content-core.js'

describe('content core helpers', () => {
  it('filters drafts and sorts posts by publish date descending', () => {
    const posts = [
      {
        id: 'older',
        data: { draft: false, publishDate: new Date('2026-01-01') },
      },
      {
        id: 'newer',
        data: { draft: false, publishDate: new Date('2026-03-01') },
      },
      {
        id: 'draft',
        data: { draft: true, publishDate: new Date('2026-04-01') },
      },
    ]

    expect(sortLatestPosts(posts).map((post) => post.id)).toEqual(['newer', 'older'])
  })

  it('removes imports, matching JSX blocks, and the interactive code environment heading', () => {
    const source = [
      "import Demo from './Demo';",
      "import Chart from './Chart';",
      '',
      'Here is the prose that should stay.',
      '',
      '<Demo label="keep me out of the output" />',
      '',
      '<Chart>',
      '  <span>wrapped content</span>',
      '</Chart>',
      '',
      '<h2><a href="#interactive-code-environment">interactive code environment</a></h2>',
      '',
      'The last line should stay too.',
    ].join('\n')

    expect(cleanMDXContent(source)).toContain('Here is the prose that should stay.')
    expect(cleanMDXContent(source)).toContain('The last line should stay too.')
    expect(cleanMDXContent(source)).not.toContain('import Demo')
    expect(cleanMDXContent(source)).not.toContain('<Demo')
    expect(cleanMDXContent(source)).not.toContain('<Chart>')
    expect(cleanMDXContent(source)).not.toContain('interactive code environment')
  })

  it('loads latest posts through the astro content filter', async () => {
    vi.resetModules()
    vi.doMock('astro:content', () => ({
      getCollection: async (_name, filter) => {
        const posts = [
          {
            id: 'draft',
            data: { draft: true, publishDate: new Date('2026-01-01') },
          },
          {
            id: 'published-new',
            data: { draft: false, publishDate: new Date('2026-03-01') },
          },
          {
            id: 'published-old',
            data: { draft: false, publishDate: new Date('2026-02-01') },
          },
        ]

        return posts.filter((post) => filter(post))
      },
    }))

    const contentModule = await import('../src/utils/content.js')
    expect(contentModule.latestPosts.map((post) => post.id)).toEqual([
      'published-new',
      'published-old',
    ])
  })
})
