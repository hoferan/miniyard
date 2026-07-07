# APIs

## What belongs here

Small client tools that fetch and display live data from a public,
third-party API — weather, currency rates, jokes/quotes, and similar. Each
module proxies its external call through a same-origin Next.js Route
Handler so API keys never reach the browser and CORS is never a problem.

## Examples

- Weather lookup
- Currency converter
- Random joke / quote

## What does NOT belong here

- Modules with no external network call (→ `utilities`)
- Modules that only need localStorage/game state (→ `games`)
- Anything requiring a database or user accounts (not supported by miniyard)

## Module structure

```text
src/modules/apis/<name>/
  meta.ts        # module metadata (slug, title, tags, createdAt)
  api.ts         # client fetch wrapper — calls this app's own proxy route
  logic.ts       # pure validation/formatting, no fetch, no React
  logic.test.ts  # Vitest unit tests for logic.ts
  index.tsx      # UI — calls api.ts, pipes results through logic.ts
  messages.ts    # user-facing strings (loading/error/empty states)
src/app/api/apis/<name>/route.ts   # server-side proxy, holds any API key
```

## Brainstorm questions (Claude asks these before writing any code)

1. Which external API will this module call, and does it require an API key?
2. Does the external API's CORS policy allow direct browser calls, or is the
   proxy route required? (Default: use the proxy unless the API is public,
   CORS-open, and keyless.)
3. What does the loading state look like while the request is in flight?
4. What does the error state look like (upstream down, rate-limited, invalid
   input) and what copy goes in `messages.ts`?
5. Does the external API have a free-tier rate limit that affects UX (e.g.
   debounce input, cache the last result)?
6. Does the external API's terms of service require attribution? If so,
   where does it go on the module page?

## Conventions

- Never call the external API directly from a client component — always go
  through `api.ts` and (when a key or CORS is involved) the proxy route.
- Never commit a real API key — env var only, documented in `.env.example`.
- E2E tests mock the proxy route response; they never hit the real external
  API.
