;(() => {
  const modelContext = document.modelContext || navigator.modelContext
  if (!window.isSecureContext || !modelContext?.registerTool) return

  const pageTargets = {
    home: '/',
    blog: '/blog',
    about: '/about',
    contact: '/contact',
    rss: '/rss/',
  }

  const contactTargets = {
    email: 'mailto:jeremy.c.london@gmail.com',
    form: pageTargets.contact,
    github: 'https://github.com/jeremy-london',
    linkedin: 'https://www.linkedin.com/in/jeremyclondon/',
  }

  const normalizeList = (value) => {
    if (!value) return []
    return String(value)
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  }

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const wildcardMatch = (haystack, term) => {
    if (!term) return true
    if (!term.includes('*')) return haystack.includes(term)
    const pattern = term
      .split('*')
      .map((part) => escapeRegExp(part))
      .join('.*')
    return new RegExp(`^${pattern}$`, 'i').test(haystack)
  }

  const matchesQuery = (text, query) => {
    const terms = String(query || '')
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)

    if (terms.length === 0) return true
    return terms.every((term) => wildcardMatch(text, term))
  }

  const getPosts = () =>
    [...document.querySelectorAll('.posts__post')].map((post) => {
      const title =
        post.querySelector('.post__title')?.textContent?.trim() ?? ''
      const link = post.querySelector('.post__link')?.href ?? ''
      const details = post.querySelector('.post__details')?.textContent ?? ''
      const description =
        post.querySelector('.post__preview')?.textContent?.trim() ?? ''
      const date = details.match(/Published:\s*(.*?)\s*\/\//)?.[1]?.trim() ?? ''
      const category = details.match(/Category:\s*(.*)$/)?.[1]?.trim() ?? ''

      return { title, url: link, date, category, description }
    })

  const filterPosts = ({
    query = '',
    category = '',
    year = '',
    sort = 'newest',
  } = {}) => {
    const categoryValues = normalizeList(category)
    const yearValues = normalizeList(year)

    const matching = getPosts().filter((post) => {
      const searchText = [
        post.title,
        post.description,
        post.category,
        post.date,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!matchesQuery(searchText, query)) return false
      if (
        categoryValues.length &&
        !categoryValues.includes(post.category.toLowerCase())
      ) {
        return false
      }
      if (
        yearValues.length &&
        !yearValues.some((value) => post.date.includes(value))
      ) {
        return false
      }
      return true
    })

    return [...matching].sort((a, b) => {
      if (sort === 'oldest') return Date.parse(a.date) - Date.parse(b.date)
      return Date.parse(b.date) - Date.parse(a.date)
    })
  }

  const buildArchiveUrl = (params) => {
    const url = new URL(pageTargets.blog, window.location.origin)
    if (params.query) url.searchParams.set('q', params.query)
    if (params.category) url.searchParams.set('category', params.category)
    if (params.tag) url.searchParams.set('tag', params.tag)
    if (params.year) url.searchParams.set('year', params.year)
    if (params.month) url.searchParams.set('month', params.month)
    if (params.sort && params.sort !== 'newest') {
      url.searchParams.set('sort', params.sort)
    }
    return url.toString()
  }

  const registerWebMcp = async () => {
    if (window.__jeremyRssWebMcpAbortController) {
      window.__jeremyRssWebMcpAbortController.abort()
    }

    const controller = new AbortController()
    window.__jeremyRssWebMcpAbortController = controller

    const tools = [
      {
        name: 'search_blog_posts',
        title: 'Search blog posts',
        description:
          "Searches Jeremy London's RSS feed preview by text, category, or year and returns matching post metadata. Does not navigate or change the page.",
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Free-text search across visible RSS post metadata.',
            },
            category: {
              type: 'string',
              description: 'One or more category slugs, comma-separated.',
            },
            year: {
              type: 'string',
              description: 'One or more years, comma-separated.',
            },
            sort: {
              type: 'string',
              enum: ['newest', 'oldest'],
              default: 'newest',
              description: 'Sort order for the returned posts.',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 20,
              default: 10,
              description: 'Maximum number of posts to return.',
            },
          },
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: async (input = {}) => {
          const limit = Number.isFinite(Number(input.limit))
            ? Math.max(1, Math.min(20, Number(input.limit)))
            : 10
          const matching = filterPosts(input)
          return {
            total: matching.length,
            returned: Math.min(limit, matching.length),
            posts: matching.slice(0, limit),
          }
        },
      },
      {
        name: 'open_blog_archive',
        title: 'Open blog archive',
        description:
          'Opens the blog archive with the requested search, category, tag, year, month, or sort filters applied. Changes the current page.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Free-text search query.' },
            category: {
              type: 'string',
              description: 'Category slug or comma-separated category slugs.',
            },
            tag: {
              type: 'string',
              description: 'Tag slug or comma-separated tag slugs.',
            },
            year: {
              type: 'string',
              description: 'Year or comma-separated years.',
            },
            month: {
              type: 'string',
              description: 'A month in YYYY-MM format.',
            },
            sort: {
              type: 'string',
              enum: ['newest', 'oldest', 'short', 'long'],
              default: 'newest',
              description: 'Sort order.',
            },
          },
        },
        annotations: { readOnlyHint: false },
        execute: async (input = {}) => {
          const url = buildArchiveUrl(input)
          window.location.assign(url)
          return { success: true, url }
        },
      },
      {
        name: 'open_site_page',
        title: 'Open site page',
        description:
          'Opens one of the main site pages. Changes the current page.',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'string',
              enum: Object.keys(pageTargets),
              description: 'The page to open.',
            },
          },
          required: ['page'],
        },
        annotations: { readOnlyHint: false },
        execute: async ({ page } = {}) => {
          const target = pageTargets[page]
          if (!target) return { error: 'page is required' }
          window.location.assign(target)
          return { success: true, url: target }
        },
      },
      {
        name: 'set_site_theme',
        title: 'Set site theme',
        description: 'Changes the RSS preview theme to system, light, or dark.',
        inputSchema: {
          type: 'object',
          properties: {
            theme: {
              type: 'string',
              enum: ['system', 'light', 'dark'],
              description: 'Theme preference to apply.',
            },
          },
          required: ['theme'],
        },
        annotations: { readOnlyHint: false },
        execute: async ({ theme } = {}) => {
          if (!theme) return { error: 'theme is required' }
          const resolved =
            theme === 'system'
              ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
              : theme
          document.body.className = ''
          document.body.classList.add(resolved)
          localStorage.setItem('rss-theme', resolved)
          return { success: true, theme }
        },
      },
      {
        name: 'open_rss_feed',
        title: 'Open RSS feed',
        description:
          "Opens Jeremy London's RSS feed. Changes the current page.",
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: false },
        execute: async () => {
          window.location.assign('/rss.xml')
          return { success: true, url: '/rss.xml' }
        },
      },
      {
        name: 'open_contact_channel',
        title: 'Open contact channel',
        description:
          "Opens Jeremy London's email, contact form, GitHub profile, or LinkedIn profile. Changes the current page or opens a mail client.",
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              enum: ['email', 'form', 'github', 'linkedin'],
              description: 'The contact channel to open.',
            },
          },
          required: ['channel'],
        },
        annotations: { readOnlyHint: false },
        execute: async ({ channel } = {}) => {
          const target = contactTargets[channel]
          if (!target) return { error: 'channel is required' }
          window.location.assign(target)
          return { success: true, url: target }
        },
      },
    ]

    for (const tool of tools) {
      await modelContext.registerTool(tool, { signal: controller.signal })
    }
  }

  const start = () => {
    void registerWebMcp().catch((error) => {
      console.warn('RSS WebMCP registration failed', error)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }

  window.addEventListener('pagehide', () => {
    window.__jeremyRssWebMcpAbortController?.abort()
    window.__jeremyRssWebMcpAbortController = undefined
  })
})()
