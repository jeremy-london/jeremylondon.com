/**
 * React WebMCP example - custom hook wrapping existing cart service.
 */

import { useEffect } from 'react'

interface CartService {
  add: (sku: string, quantity: number) => Promise<{ count: number }>
}

interface UseWebMcpCartToolsOptions {
  cartService: CartService
}

export function useWebMcpCartTools({ cartService }: UseWebMcpCartToolsOptions): void {
  useEffect(() => {
    if (!('modelContext' in document)) return

    const controller = new AbortController()

    void document.modelContext.registerTool(
      {
        name: 'add_to_cart',
        title: 'Add to cart',
        description:
          'Adds a product to the shopping cart by SKU. Does not checkout or charge payment.',
        inputSchema: {
          type: 'object',
          properties: {
            sku: { type: 'string', description: 'Product SKU' },
            quantity: { type: 'integer', minimum: 1, default: 1 }
          },
          required: ['sku']
        },
        annotations: { readOnlyHint: false },
        execute: async ({ sku, quantity = 1 }) => {
          if (!sku) return { error: 'sku is required' }

          try {
            const result = await cartService.add(sku, quantity)
            return { success: true, cartItemCount: result.count }
          } catch {
            return { error: 'Failed to add item to cart' }
          }
        }
      },
      { signal: controller.signal }
    )

    return () => controller.abort()
  }, [cartService])
}

// Usage in a component:
// function ProductPage() {
//   useWebMcpCartTools({ cartService })
//   return <div>...</div>
// }
