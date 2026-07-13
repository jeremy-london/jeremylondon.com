# WebMCP API Reference

Condensed reference from the [W3C WebMCP draft](https://webmachinelearning.github.io/webmcp/) and [Chrome developer docs](https://developer.chrome.com/docs/ai/webmcp/).

**Status**: Draft Community Group Report - API may change.

## Entry Point

```typescript
document.modelContext  // ModelContext instance on each Document
```

Access is on `document`, not `navigator`. Requires a secure context and origin isolation.

## ModelContext.registerTool

```typescript
registerTool(
  tool: ModelContextTool,
  options?: ModelContextRegisterToolOptions
): Promise<undefined>
```

Registers a tool agents can invoke. Resolves when registration completes.

### Rejection cases

| Exception | Condition |
|---|---|
| `InvalidStateError` | Document not fully active; duplicate tool name; empty name or description; invalid name format |
| `SecurityError` | Document not origin-keyed (except `file:` scheme); invalid `exposedTo` origin |
| `NotAllowedError` | `tools` permissions policy disallows registration |
| `TypeError` | `inputSchema` serializes to `undefined` via JSON.stringify |

### ModelContextTool

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Unique ID: 1-128 chars, `[a-zA-Z0-9_.-]` |
| `title` | string | no | Human-readable label for browser UI |
| `description` | string | yes | Natural language; agents use this to select tools |
| `inputSchema` | object | no | JSON Schema for input parameters |
| `execute` | `(input: object) => Promise<any>` | yes | Called when agent invokes the tool |
| `annotations` | ToolAnnotations | no | Behavioral hints |

### ToolAnnotations

| Field | Default | Meaning |
|---|---|---|
| `readOnlyHint` | `false` | Tool does not modify state |
| `untrustedContentHint` | `false` | Output may contain untrusted/user-generated content |

### ModelContextRegisterToolOptions

| Field | Type | Description |
|---|---|---|
| `signal` | AbortSignal | Abort unregisters the tool automatically |
| `exposedTo` | string[] | Origins (as URL strings) that can see this tool in the document tree |

Example with cross-origin exposure:

```typescript
await document.modelContext.registerTool(
  { name: 'shared_action', description: '...', execute: async () => ({ ok: true }) },
  {
    signal: controller.signal,
    exposedTo: ['https://partner.example.com']
  }
)
```

## Events

```typescript
document.modelContext.ontoolchange = (event) => { /* tools added/removed */ }
```

Fired on `toolchange` when the tool map changes in the document tree. Timing relative to other tasks is not guaranteed (uses `webmcp` task source).

## Permissions Policy

Feature name: `tools`

- Default allowlist: `'self'`
- Top-level and same-origin contexts: allowed
- Cross-origin iframes: blocked unless parent sets `allow="tools"`

```html
<iframe src="https://widget.example.com" allow="tools"></iframe>
```

## Origin Isolation

WebMCP requires origin-keyed agent clusters. Disabled when:

- `document.domain` is set
- `Origin-Agent-Cluster: ?0` response header is used

Ensure your deployment does not disable origin isolation.

## Agent Interaction Model

- Tools run on the document's event loop (main thread JavaScript)
- A visible browser tab or webview must be open
- Browser agents observe tools via implementation-defined "observations" (may include screenshots, a11y tree, tool map)
- In-page JavaScript agents can call `registerTool` and observe `ontoolchange` directly

## Limitations

- **No headless execution** - agents cannot call tools without a browsing context
- **Discoverability** - clients must visit the page to discover tools
- **Complex UIs** - may require refactoring to expose state through `execute`
- **Declarative API** - HTML form annotations exist in Chrome docs but spec §4.3 is incomplete; prefer imperative API

## Imperative vs Declarative

| Approach | Best for |
|---|---|
| Imperative (`registerTool`) | SPAs, custom widgets, stateful logic, confirmation dialogs |
| Declarative (HTML form attrs) | Simple form submit flows when browser support is sufficient |

See [examples/form-tool.html](../examples/form-tool.html) for declarative patterns. Prefer imperative until declarative synthesis is stable.

## Related Specifications

- [JSON Schema](https://json-schema.org/draft/2020-12/json-schema-core.html) - inputSchema format
- [Model Context Protocol](https://modelcontextprotocol.io/) - complementary server-side protocol
- [Permissions Policy](https://w3c.github.io/webappsec-permissions-policy/) - `tools` feature
