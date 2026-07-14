import { describe, expect, it, vi } from 'vitest'

import { buildRssItems, resolveSite, sanitizeRssContent } from '../src/utils/rss-core.js'
import { buildWebmcpBlogIndex } from '../src/utils/webmcp-core.ts'

describe('rss helpers', () => {
  it('resolves the site from context or falls back to the request URL', () => {
    expect(resolveSite({ url: 'https://example.com/blog/post/' }, true).toString()).toBe(
      'https://example.com/',
    )
    expect(
      resolveSite(
        {
          url: 'https://example.com/blog/post/',
          site: new URL('https://jeremylondon.com/'),
        },
        false,
      ).toString(),
    ).toBe('https://jeremylondon.com/')
  })

  it('builds rss items with absolute links and sanitized content', () => {
    const items = buildRssItems({
      blog: [
        {
          id: 'post-one',
          data: {
            title: 'Post One',
            excerpt: 'Summary',
            author: 'jeremy-london',
            category: 'ai-systems',
          },
          body: '# Hello',
        },
      ],
      authors: [{ slug: 'jeremy-london', name: 'Jeremy London' }],
      site: new URL('https://jeremylondon.com/'),
      formatDate: () => 'Jul 12, 2026',
      renderContent: () => '<p>hello <img src="/x.png" onerror="alert(1)"></p>',
    })

    expect(items).toEqual([
      {
        title: 'Post One',
        pubDate: 'Jul 12, 2026',
        description: 'Summary',
        author: 'Jeremy London',
        categories: ['ai-systems'],
        link: 'https://jeremylondon.com/blog/post-one/',
        customData: '<language>en-us</language>',
        content: expect.stringContaining('<img'),
      },
    ])
    expect(items[0].content).not.toContain('onerror')
  })

  it('rejects missing authors explicitly', () => {
    expect(() =>
      buildRssItems({
        blog: [
          {
            id: 'post-one',
            data: {
              title: 'Post One',
              excerpt: 'Summary',
              author: 'missing-author',
              category: 'ai-systems',
            },
            body: '# Hello',
          },
        ],
        authors: [{ slug: 'jeremy-london', name: 'Jeremy London' }],
        site: new URL('https://jeremylondon.com/'),
        formatDate: () => 'Jul 12, 2026',
        renderContent: () => '<p>hello</p>',
      }),
    ).toThrow('Missing author for slug: missing-author')
  })

  it('sanitizes hostile html but keeps images', () => {
    const sanitized = sanitizeRssContent('<p>Hello<script>alert(1)</script><img src="/x.png"></p>')
    expect(sanitized).toContain('<img')
    expect(sanitized).not.toContain('<script')
  })

  it('builds the rss route response through the page wrapper', async () => {
    vi.resetModules()
    const rssMock = vi.fn((payload) => payload)

    vi.doMock('@astrojs/rss', () => ({
      default: rssMock,
    }))
    vi.doMock('@data/authors', () => ({
      authors: [{ slug: 'jeremy-london', name: 'Jeremy London' }],
    }))
    vi.doMock('@utils/all', () => ({
      getFormattedDate: () => 'Jul 12, 2026',
    }))
    vi.doMock('@utils/content', () => ({
      cleanMDXContent: (body) => body,
      latestPosts: [
        {
          id: 'post-one',
          data: {
            title: 'Post One',
            excerpt: 'Summary',
            author: 'jeremy-london',
            category: 'ai-systems',
            publishDate: new Date('2026-07-12T12:00:00.000Z'),
          },
          body: 'hello',
        },
      ],
    }))
    vi.doMock('react-dom/server', () => ({
      renderToStaticMarkup: () => '<p>hello</p>',
    }))
    vi.doMock('streamdown', () => ({
      Streamdown: 'streamdown',
    }))

    const { GET } = await import('../src/pages/rss.xml.js')
    const result = await GET({
      url: 'https://example.com/rss.xml',
      site: new URL('https://example.com/'),
    })

    expect(rssMock).toHaveBeenCalledOnce()
    expect(result.title).toBe('jeremylondon.com')
    expect(result.site.toString()).toBe('https://example.com/')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      title: 'Post One',
      pubDate: 'Jul 12, 2026',
      description: 'Summary',
      author: 'Jeremy London',
      link: 'https://example.com/blog/post-one/',
    })
  })
})

describe('webmcp helpers', () => {
  it('builds the blog index with label fallback, slugs, and floored reading time', () => {
    const index = buildWebmcpBlogIndex(
      [
        {
          id: 'post-one',
          data: {
            title: 'Post One',
            excerpt: 'Summary',
            category: 'unknown-category',
            tags: ['AI & Ops', 'Rust'],
            publishDate: new Date('2026-07-12T00:00:00.000Z'),
          },
          body: `import Demo from './Demo';\n\n<Demo />\n\nShort body.`,
        },
      ],
      [{ slug: 'ai-systems', title: 'AI Systems' }],
    )

    expect(index[0]).toMatchObject({
      id: 'post-one',
      title: 'Post One',
      excerpt: 'Summary',
      category: 'unknown-category',
      categoryLabel: 'unknown-category',
      tags: [
        { label: 'AI & Ops', slug: 'ai-and-ops' },
        { label: 'Rust', slug: 'rust' },
      ],
      date: '2026-07-12T00:00:00.000Z',
      year: '2026',
      month: '2026-07',
      readingTimeMinutes: 3,
    })
  })

  it('loads the wrapper module from latest posts', async () => {
    vi.resetModules()
    vi.doMock('astro:content', () => ({
      getCollection: async () => [
        {
          id: 'post-one',
          data: {
            draft: false,
            title: 'Post One',
            excerpt: 'Summary',
            category: 'ai-systems',
            tags: [],
            publishDate: new Date('2026-07-12T12:00:00.000Z'),
          },
          body: 'Short body.',
        },
      ],
    }))

    const module = await import('../src/utils/webmcp.ts')
    expect(module.webmcpPageTargets.blog).toBe('/blog')
    expect(module.webmcpBlogIndex).toHaveLength(1)
    expect(module.webmcpBlogIndex[0].id).toBe('post-one')
  })
})
