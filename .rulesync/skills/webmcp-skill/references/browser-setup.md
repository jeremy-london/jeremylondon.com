# WebMCP Browser Setup

How to enable, test, and ship WebMCP in Chrome.

**Status (June 2026)**: Draft W3C spec; Chrome origin trial for Chrome 149-156. API may change.

## Browser Support

| Environment | Support |
|---|---|
| Chrome 149+ (origin trial) | Production testing with registered origin |
| Chrome (local flag) | `#enable-webmcp-testing` for development |
| Gemini in Chrome | Primary agent consumer during origin trial |
| Edge | Microsoft co-authored spec; verify current release notes before assuming support |
| Firefox / Safari | No announced support as of mid-2026 |

## Local Development

1. Open `chrome://flags/#enable-webmcp-testing`
2. Set **WebMCP for testing** to **Enabled**
3. Relaunch Chrome
4. Serve your site over HTTPS or `localhost` (secure context required)
5. Ensure origin isolation is not disabled

Verify API availability:

```javascript
if ('modelContext' in document) {
  console.log('WebMCP available')
} else {
  console.warn('WebMCP not available - check flag, secure context, origin isolation')
}
```

## Production: Chrome Origin Trial

For real-user testing beyond the local flag:

1. Read [Chrome WebMCP docs](https://developer.chrome.com/docs/ai/webmcp)
2. Follow [origin trial signup](https://developer.chrome.com/docs/web-platform/origin-trials) for your origin
3. Add the origin trial meta tag or HTTP header to your pages
4. Trial runs Chrome 149 through 156 (dates subject to change - verify on Chrome Status)

Origin trials allow production traffic on registered origins without each user enabling flags.

## Model Context Tool Inspector Extension

Primary debugging tool for implementers:

1. Install from the link on [Chrome WebMCP docs](https://developer.chrome.com/docs/ai/webmcp)
2. Navigate to your page
3. Open the extension - see registered tools and their schemas
4. Manually invoke tools with test inputs
5. Chat with the built-in agent (uses `gemini-3-flash-preview` by default) to test natural-language tool selection

Use the inspector to verify:

- Tools appear after page load
- JSON Schema accepts/rejects inputs correctly
- Return values are structured and readable
- Agent selects the intended tool from prompts

## Official Demos

Reference implementations (links on Chrome docs):

| Demo | API style |
|---|---|
| WebMCP zaMaker | Imperative |
| Travel demo (React) | Imperative |
| Le Petit Bistro | Declarative (forms) |

Source code is linked from the [Chrome WebMCP page](https://developer.chrome.com/docs/ai/webmcp).

## Polyfill (Experimental)

A community polyfill is documented at [docs.mcpb.ai](https://docs.mcpb.ai). Treat as experimental - API surface may drift from the W3C spec. Use for prototyping only; test against native Chrome when possible.

## Deployment Checklist

- [ ] HTTPS in production
- [ ] Origin isolation enabled (no `document.domain`)
- [ ] Origin trial token deployed (if not using flag-only dev)
- [ ] `tools` permissions policy allows registration on target pages
- [ ] Cross-origin embeds use `allow="tools"` where needed
- [ ] Inspector extension smoke test passes before release

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `document.modelContext` undefined | Flag off, unsupported browser, or non-secure context |
| `SecurityError` on register | Origin not origin-keyed |
| Tools not visible to agent | Page not loaded, registration failed silently, or policy blocked |
| Agent uses DOM instead of tools | Descriptions unclear, schemas too loose, or tools registered too late |

## Further Reading

- [WebMCP explainer (GitHub)](https://github.com/webmachinelearning/webmcp)
- [W3C WebMCP spec](https://webmachinelearning.github.io/webmcp/)
- [Chrome Status: WebMCP](https://chromestatus.com/) - search "WebMCP" for implementation status
