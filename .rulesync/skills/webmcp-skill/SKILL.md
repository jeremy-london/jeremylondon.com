---
name: webmcp-skill
description: >-
  Implements WebMCP (Web Model Context Protocol) on websites using
  document.modelContext.registerTool. Covers tool design, JSON Schema
  inputs, security annotations, origin isolation, and Chrome testing.
  Use when adding WebMCP tools to web apps, exposing page features to
  browser agents, or when the user mentions WebMCP, modelContext, or
  agent-ready web tools. Not for server-side MCP servers.
---

# WebMCP Skill

Guide for exposing website features to browser agents via the WebMCP API.

## WebMCP vs Server MCP

| | Server MCP | WebMCP |
|---|---|---|
| Runtime | Node/Python server | Browser tab (JavaScript) |
| API | MCP SDK `server.tool()` | `document.modelContext.registerTool()` |
| Discovery | Client connects to server URL | Agent visits page; tools registered in-page |
| Auth | OAuth, API keys | Existing web session/cookies |

For server-side MCP, use an `mcp-builder` skill instead. This skill is **browser-only**.

## When to Use

- Adding agent-callable tools to a web app
- Replacing fragile DOM-scraping flows with structured tool calls
- Exposing forms, cart, search, or settings actions to browser agents
- User mentions WebMCP, `modelContext`, or agent-ready web tools

## When NOT to Use

- Building a standalone MCP server (backend)
- Headless automation without a visible browser tab
- Non-web environments (CLI, mobile native)

## Prerequisites

Before registering tools, verify:

- [ ] **Secure context** - HTTPS or `localhost`
- [ ] **Origin isolation** - document is origin-keyed; WebMCP disabled if `document.domain` is set or `Origin-Agent-Cluster: ?0`
- [ ] **Permissions policy** - `tools` feature allowed (default `self`; cross-origin iframes need `allow="tools"`)
- [ ] **Browser support** - Chrome flag for local dev or origin trial for production (see [references/browser-setup.md](references/browser-setup.md))
- [ ] **Visible tab** - tool `execute` runs in an open browser context; no headless calls

## API Choice

```text
Simple HTML form submit?
  └─ Yes → Consider declarative HTML annotations (spec still evolving; see examples/form-tool.html)
  └─ No  → Use imperative registerTool() (recommended for SPAs and complex logic)
```

Prefer the **imperative API** until declarative form synthesis is stable in the spec.

## Implementation Workflow

Copy this checklist and track progress:

```text
Task Progress:
- [ ] Step 1: Audit UI actions worth exposing
- [ ] Step 2: Map each action to one tool (reuse existing app functions)
- [ ] Step 3: Define name, title, description, inputSchema
- [ ] Step 4: Implement execute with structured return values
- [ ] Step 5: Set annotations (readOnlyHint, untrustedContentHint)
- [ ] Step 6: Register on mount; unregister on unmount via AbortSignal
- [ ] Step 7: Test with Chrome flag + Model Context Tool Inspector
```

### Step 1: Audit actions

List user-facing actions agents should perform: search, filter, add to cart, submit form, navigate, etc. Skip actions that require opaque visual interaction unless wrapped in a dedicated tool.

### Step 2: Reuse existing logic

Call the same functions your UI buttons use. Do not duplicate business logic in `execute`.

### Step 3: Define the tool

**Name rules** (from spec):

- 1-128 characters
- ASCII alphanumeric, `_`, `-`, `.` only
- Unique within the page's tool map

**Description**: Plain language stating what the tool does **and** what side effects it has. Agents rely on this to choose tools and request user consent.

**inputSchema**: JSON Schema object. Keep parameters minimal - only what the action needs.

### Step 4: Implement execute

Return structured JSON agents can parse. Prefer `{ error: "..." }` over thrown exceptions for expected failures.

```typescript
execute: async ({ sku, quantity = 1 }) => {
  if (!sku) return { error: 'sku is required' }
  const result = await cartService.add(sku, quantity)
  return { success: true, cartItemCount: result.count }
}
```

### Step 5: Annotations

```typescript
annotations: {
  readOnlyHint: true,           // tool does not mutate state
  untrustedContentHint: true    // output includes user-generated content
}
```

See [references/security.md](references/security.md) for when to set each.

### Step 6: Register and clean up

```typescript
const controller = new AbortController()

await document.modelContext.registerTool(
  {
    name: 'add_to_cart',
    title: 'Add to cart',
    description: 'Adds a product to the shopping cart by SKU. Does not checkout.',
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
      const result = await cartService.add(sku, quantity)
      return { success: true, cartItemCount: result.count }
    }
  },
  { signal: controller.signal }
)

// On page unload or component unmount:
controller.abort()
```

### Step 7: Dynamic tools

If tools change at runtime, listen for registration updates:

```typescript
document.modelContext.ontoolchange = () => {
  // Refresh UI or internal tool list
}
```

## Tool Design Rules

1. **One action per tool** - `search_products` and `add_to_cart` are separate tools
2. **Descriptions match behavior** - never describe "view cart" if `execute` triggers purchase
3. **State side effects explicitly** - "Adds item; does not charge" vs "Completes purchase"
4. **Confirm destructive actions in-app** - show a dialog inside `execute` before purchases, deletes, or sends
5. **Minimize inputSchema fields** - avoid requesting age, location, or history unless strictly needed
6. **No injection in metadata** - descriptions and return values must not contain hidden agent instructions
7. **Mark UGC as untrusted** - forum posts, reviews, comments → `untrustedContentHint: true`

## Framework Integration

### Vanilla / SPA

Register after app initialization when DOM and state are ready.

### React

```typescript
useEffect(() => {
  const controller = new AbortController()
  void document.modelContext.registerTool({ /* ... */ }, { signal: controller.signal })
  return () => controller.abort()
}, [dependencies])
```

Register after hydration on SSR apps. Pass stable dependencies only.

### Angular

Chrome documents experimental WebMCP support in Angular. Follow framework-specific guides when available; fall back to imperative `registerTool` in a service `ngOnInit`.

### Cross-origin iframes

Parent must allow tools in the iframe:

```html
<iframe src="https://embed.example.com" allow="tools"></iframe>
```

Use `exposedTo` in `registerTool` options to expose tools to specific origins. See [references/api-reference.md](references/api-reference.md).

## Testing

1. Enable Chrome flag: `chrome://flags/#enable-webmcp-testing` → Enabled → relaunch
2. Install [Model Context Tool Inspector Extension](https://developer.chrome.com/docs/ai/webmcp)
3. Load your page - verify tools appear in the inspector
4. Manually invoke each tool with valid and invalid inputs
5. Prompt the inspector agent in natural language; confirm it picks the right tool
6. Check return values are clear and JSON Schema validates inputs

Full setup: [references/browser-setup.md](references/browser-setup.md)

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `SecurityError` | Not origin-isolated | Remove `document.domain`; check `Origin-Agent-Cluster` header |
| `NotAllowedError` | `tools` policy blocked | Top-level page or add `allow="tools"` on iframe |
| `InvalidStateError` | Duplicate tool name | Unregister first or use unique names |
| API undefined | Flag off or unsupported browser | Enable flag or join origin trial |

## Additional Resources

- API details: [references/api-reference.md](references/api-reference.md)
- Security guidance: [references/security.md](references/security.md)
- Browser setup: [references/browser-setup.md](references/browser-setup.md)
- Examples: [examples/imperative-tool.ts](examples/imperative-tool.ts), [examples/react-spa-tool.tsx](examples/react-spa-tool.tsx), [examples/form-tool.html](examples/form-tool.html)
- W3C spec: <https://webmachinelearning.github.io/webmcp/>
- Chrome docs: <https://developer.chrome.com/docs/ai/webmcp>
