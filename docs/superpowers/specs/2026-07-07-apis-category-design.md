# Spec: APIs Category

**Date:** 2026-07-07
**Category:** New top-level category (`apis`)
**Workflow:** New category (`/new-category` checklist)

## Problem / Motivation

miniyard currently has two categories: `utilities` (pure client-side logic) and
`games` (client-side, no persistence beyond localStorage high scores). Neither
fits modules that need to call an external, third-party API (weather, currency
rates, jokes, etc.). A new category is needed with its own conventions for
handling network calls, API keys, and error/loading states, since these don't
exist anywhere else in the codebase yet.

## Category identity

| Field | Value |
|---|---|
| Slug | `apis` |
| Display label | APIs |
| Icon | 🔌 |
| Description | "Fun and useful mini-apps powered by public APIs." |
| First example modules (future, not part of this spec) | Weather lookup, currency converter, random joke/quote |

## Design

### 1. Standard category scaffolding

Follows the existing `/new-category` checklist exactly:

- `src/modules/apis/README.md` — category definition (content below)
- `src/app/apis/page.tsx` — listing page (standard template, `getModulesByCategory('apis')`)
- `src/app/apis/loading.tsx` — `CategoryPageSkeleton`
- `src/app/apis/[slug]/page.tsx` — module detail page (standard template, `ModulePageLayout` + `ApisModuleContent`)
- `src/app/apis/[slug]/loading.tsx` — `ModulePageSkeleton`
- `src/components/apis-module-content.tsx` — `componentMap` + dynamic imports, same shape as `utilities-module-content.tsx` / `games-module-content.tsx`
- `src/lib/types.ts` — add `'apis'` to the `ModuleCategory` union
- `src/components/layout/nav.tsx` — nav link for APIs
- `.github/ISSUE_TEMPLATE/new_apis_module.yml` — copied from `new_utility_tool.yml`, updated name/description/labels
- `.github/ISSUE_TEMPLATE/bug_report.yml` and `feature_request.yml` — add `apis` to the `Area` dropdown
- `.github/PULL_REQUEST_TEMPLATE.md` — add an `apis` type checkbox
- `README.md` — new "🔌 APIs" section with empty module table
- `CLAUDE.md` — categories table, project structure tree, category description

### 2. Module file structure (the part unique to this category)

Every module in `apis` uses five files instead of the usual three/four:

```text
src/modules/apis/<name>/
  meta.ts        # module metadata (slug, title, tags, createdAt) — same as other categories
  api.ts         # client-side fetch wrapper — calls this app's own proxy route, never the external API directly
  logic.ts       # pure functions only: request param validation, response shaping/formatting — no fetch, no React
  logic.test.ts  # Vitest unit tests for logic.ts
  index.tsx      # UI — calls api.ts, pipes results through logic.ts, renders with shadcn/ui
  messages.ts    # user-facing strings (loading/error/empty states are common in this category)
```

`api.ts` is new relative to the existing categories — it exists specifically to
keep `fetch` calls (and their error handling) out of `logic.ts`, so `logic.ts`
stays synchronous, pure, and trivially unit-testable exactly like in
`utilities`/`games`.

### 3. Server-side proxy route

Each module that needs to reach an external API gets a Next.js Route Handler:

```text
src/app/api/apis/<slug>/route.ts
```

Responsibilities:

- Read any required secret from a server-only env var (no `NEXT_PUBLIC_` prefix).
- Call the real external API server-side.
- Shape/validate the upstream response and return JSON to the client.
- Catch upstream failures (timeout, non-2xx status, malformed JSON) and return
  a consistent `{ error: string }` body with an appropriate HTTP status —
  never forward the raw upstream error body or leak the API key.

This is a deliberate deviation from the otherwise fully-static, client-only
architecture of `utilities`/`games`. It's necessary because:

- Browser-side requests to most third-party APIs hit CORS restrictions.
- Any API requiring a key cannot be called from the browser without exposing
  that key publicly.

A module whose external API is public, CORS-open, and keyless *may* skip the
proxy and call the API directly from `api.ts` — this is a per-module decision
made during that module's own brainstorm, not a category-wide rule, since most
useful APIs (weather, finance) require a key.

### 4. Data flow

```text
index.tsx → api.ts (fetch '/api/apis/<slug>?...') → route.ts (adds key,
  calls external API, handles upstream errors) → JSON → logic.ts
  (validate/shape) → index.tsx renders
```

### 5. Secrets handling

- Server-only env vars, e.g. `WEATHER_API_KEY` (no `NEXT_PUBLIC_` prefix) —
  only ever read inside `route.ts` files, never imported into client code.
- Documented in `.env.example` and the README setup section when a module
  introduces one, per the existing "New ENV variable" documentation rule.

### 6. Testing conventions

- `logic.test.ts` — standard Vitest unit tests, pure, no network mocking needed.
- E2E tests (`tests/e2e/<name>.spec.ts`) **must** intercept the proxy route
  with `page.route('/api/apis/**', ...)` and return a canned fixture response.
  Real external APIs are never called from CI: avoids flakiness, rate limits,
  and the need for real API keys in CI secrets.
- Route handlers themselves are thin (forward + shape + error-map) and do not
  require a dedicated unit test suite; their behavior is covered by the mocked
  E2E flow.

### 7. Category README content

`src/modules/apis/README.md`:

```markdown
# APIs

## What belongs here
Small client tools that fetch and display live data from a public, third-party
API — weather, currency rates, jokes/quotes, and similar. Each module proxies
its external call through a same-origin Next.js Route Handler.

## Examples
- Weather lookup
- Currency converter
- Random joke / quote

## What does NOT belong here
- Modules with no external network call (→ `utilities`)
- Modules that only need localStorage/game state (→ `games`)
- Anything requiring a database or user accounts (not supported by miniyard)

## Module structure
\`\`\`text
src/modules/apis/<name>/
  meta.ts
  api.ts         # client fetch wrapper, calls this app's own proxy route
  logic.ts       # pure validation/formatting, no fetch, no React
  logic.test.ts
  index.tsx
  messages.ts
src/app/api/apis/<name>/route.ts   # server-side proxy, holds any API key
\`\`\`

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
6. Does the external API's terms of service require attribution? If so, where
   does it go on the module page?

## Conventions
- Never call the external API directly from a client component — always go
  through `api.ts` and (when a key or CORS is involved) the proxy route.
- Never commit a real API key — env var only, documented in `.env.example`.
- E2E tests mock the proxy route response; they never hit the real external API.
```

## Edge cases

- **External API down / times out:** proxy route catches this and returns
  `{ error }` with a non-2xx status; `index.tsx` shows the `messages.ts` error
  copy instead of throwing.
- **Rate-limited by upstream:** same error path; module-specific messaging
  decided at that module's brainstorm.
- **Module needs no key and is CORS-open:** proxy route is skipped for that
  module only; still documented as a deliberate per-module exception in that
  module's own doc, not a category-wide change.

## Out of scope

- Building any actual module in this category (weather/currency/joke lookups
  are future `/new-module` work, not part of this category scaffold).
- A shared fetch/cache abstraction across modules — revisit only if repetition
  across 2+ real modules justifies it (YAGNI).
- Server-side rate limiting/caching of the proxy route itself.

## New files

```text
src/modules/apis/README.md
src/app/apis/page.tsx
src/app/apis/loading.tsx
src/app/apis/[slug]/page.tsx
src/app/apis/[slug]/loading.tsx
src/components/apis-module-content.tsx
.github/ISSUE_TEMPLATE/new_apis_module.yml
```

## Changed files

```text
src/lib/types.ts                          # ModuleCategory union += 'apis'
src/components/layout/nav.tsx             # nav link
.github/ISSUE_TEMPLATE/bug_report.yml     # Area dropdown += apis
.github/ISSUE_TEMPLATE/feature_request.yml # Area dropdown += apis
.github/PULL_REQUEST_TEMPLATE.md          # apis type checkbox
README.md                                 # new APIs section
CLAUDE.md                                 # categories table, project structure, new-category reference
```

## Verification

- `npm run typecheck` — `ModuleCategory` union change must be valid
- `npm run build` — new `/apis` routes must compile and prerender
- `npm run test` — no regressions
- Manual: `/apis` listing page renders (empty state, no modules yet) and nav
  link works
