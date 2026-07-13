/**
 * Vanilla TypeScript WebMCP example.
 * Registers a search tool with AbortSignal cleanup on page unload.
 */

interface SearchResult {
  id: string
  title: string
  url: string
}

async function searchCatalog(query: string, limit = 10): Promise<SearchResult[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  if (!response.ok) throw new Error('Search failed')
  return response.json() as Promise<SearchResult[]>
}

const controller = new AbortController()

window.addEventListener('beforeunload', () => controller.abort())

async function registerSearchTool(): Promise<void> {
  if (!('modelContext' in document)) {
    console.warn('WebMCP not available')
    return
  }

  await document.modelContext.registerTool(
    {
      name: 'search_catalog',
      title: 'Search catalog',
      description:
        'Searches the product catalog by keyword. Read-only; does not modify cart or account.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keywords'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10,
            description: 'Maximum results to return'
          }
        },
        required: ['query']
      },
      annotations: { readOnlyHint: true },
      execute: async ({ query, limit = 10 }) => {
        if (!query || typeof query !== 'string') {
          return { error: 'query is required and must be a string' }
        }

        try {
          const results = await searchCatalog(query, limit)
          return {
            count: results.length,
            results: results.map(r => ({ id: r.id, title: r.title, url: r.url }))
          }
        } catch {
          return { error: 'Search request failed' }
        }
      }
    },
    { signal: controller.signal }
  )
}

void registerSearchTool()
