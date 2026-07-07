# APIs Category Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a new top-level `apis` category in miniyard — routes, nav, types, GitHub templates, and docs — so the first API-backed module can be built on top of it via `/new-module` later.

**Architecture:** Mirror the existing `utilities`/`games` category structure exactly (registry-driven `page.tsx`/`loading.tsx`/`[slug]` routes, a `*-module-content.tsx` componentMap, shared `ModulePageLayout`/skeletons) and wire `apis` into every place that currently hardcodes the two existing categories. No API modules are built in this plan — it produces an empty, working `/apis` listing page and all the supporting plumbing.

**Tech Stack:** Next.js 14 App Router, TypeScript (strict), Tailwind CSS, shadcn/ui, lucide-react icons, Vitest, Playwright.

## Global Constraints

- TypeScript strict mode — no `any`.
- Functional components only, `'use client'` only when interactivity/hooks/browser APIs are needed.
- No inline styles — Tailwind utility classes only.
- Every fenced code block in any `.md` file must have a language identifier (use `text` for plain-text blocks) — MD040 is enforced by CI and the pre-commit hook.
- Commits use Conventional Commits (`feat:`, `docs:`, `chore:`, etc.).
- Everything written in English.
- No new npm packages in this plan.
- Never push directly to `main` — this branch's changes land via PR.

---

### Task 1: `apis` category type + shared category-label maps

Adding a third category value to `ModuleCategory` exposes two places in the
codebase that hardcode a binary utilities-vs-games ternary for display labels.
Both must be fixed so they don't silently mislabel `apis` modules as
"Games"/"GAME".

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/components/module-page-layout.tsx`
- Modify: `src/components/module-card.tsx`

**Interfaces:**
- Produces: `CATEGORY_LABELS: Record<ModuleCategory, string>` and
  `CATEGORY_BADGE_LABELS: Record<ModuleCategory, string>`, both exported from
  `src/lib/types.ts`. Later tasks (and any future category work) should
  extend these maps instead of adding new ternaries.

- [ ] **Step 1: Update `src/lib/types.ts`**

Replace the full file contents with:

```ts
export type ModuleCategory = 'utilities' | 'games' | 'apis'

export type Module = {
  slug: string
  title: string
  description: string
  category: ModuleCategory
  tags: string[]
  createdAt: string
  icon?: string
}

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  utilities: 'Utilities',
  games: 'Games',
  apis: 'APIs',
}

export const CATEGORY_BADGE_LABELS: Record<ModuleCategory, string> = {
  utilities: 'UTILITY',
  games: 'GAME',
  apis: 'API',
}
```

- [ ] **Step 2: Update `src/components/module-page-layout.tsx`**

Change:

```tsx
import type { Module } from '@/lib/types'
```

to:

```tsx
import { CATEGORY_LABELS, type Module } from '@/lib/types'
```

Change:

```tsx
  const categoryLabel = mod.category === 'utilities' ? 'Utilities' : 'Games'
```

to:

```tsx
  const categoryLabel = CATEGORY_LABELS[mod.category]
```

- [ ] **Step 3: Update `src/components/module-card.tsx`**

Change:

```tsx
import { Module } from '@/lib/types'
```

to:

```tsx
import { CATEGORY_BADGE_LABELS, Module } from '@/lib/types'
```

Change:

```tsx
  const categoryLabel = module.category === 'utilities' ? 'UTILITY' : 'GAME'
```

to:

```tsx
  const categoryLabel = CATEGORY_BADGE_LABELS[module.category]
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS. (If a key is missing from either `Record`, TypeScript errors
here — this is the compile-time safety net for this task, there is no
separate runtime test for these ternary-turned-lookups.)

- [ ] **Step 5: Regression-check with existing E2E coverage**

Run: `npx playwright test module-card.spec.ts homepage.spec.ts`
Expected: PASS — labels for `utilities`/`games` modules must render exactly
as before (`UTILITY`/`GAME` badges, `Utilities`/`Games` breadcrumb labels).

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/components/module-page-layout.tsx src/components/module-card.tsx
git commit -m "feat: add apis category type and shared category label maps"
```

---

### Task 2: `apis` category README

**Files:**
- Create: `src/modules/apis/README.md`

**Interfaces:**
- Consumes: nothing (pure documentation file).
- Produces: the category definition that `/new-module` reads before
  brainstorming any future `apis` module.

- [ ] **Step 1: Create the directory and file**

Write `src/modules/apis/README.md`:

```markdown
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

\`\`\`text
src/modules/apis/<name>/
  meta.ts        # module metadata (slug, title, tags, createdAt)
  api.ts         # client fetch wrapper — calls this app's own proxy route
  logic.ts       # pure validation/formatting, no fetch, no React
  logic.test.ts  # Vitest unit tests for logic.ts
  index.tsx      # UI — calls api.ts, pipes results through logic.ts
  messages.ts    # user-facing strings (loading/error/empty states)
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
6. Does the external API's terms of service require attribution? If so,
   where does it go on the module page?

## Conventions

- Never call the external API directly from a client component — always go
  through `api.ts` and (when a key or CORS is involved) the proxy route.
- Never commit a real API key — env var only, documented in `.env.example`.
- E2E tests mock the proxy route response; they never hit the real external
  API.
```

- [ ] **Step 2: Lint markdown**

Run: `npm run lint:md`
Expected: PASS (0 errors) — all fenced blocks above use the `text` language
identifier.

- [ ] **Step 3: Commit**

```bash
git add src/modules/apis/README.md
git commit -m "docs: add apis category README"
```

---

### Task 3: App routes for the `apis` category

**Files:**
- Create: `src/app/apis/page.tsx`
- Create: `src/app/apis/loading.tsx`
- Create: `src/app/apis/[slug]/page.tsx`
- Create: `src/app/apis/[slug]/loading.tsx`
- Create: `src/components/apis-module-content.tsx`

**Interfaces:**
- Consumes: `getModulesByCategory('apis')` and `getModuleBySlug(slug)` from
  `@/lib/registry` (both already generic over `ModuleCategory`, no change
  needed); `ModulePageLayout` from `@/components/module-page-layout`;
  `CategoryPageSkeleton` from `@/components/category-page-skeleton`;
  `ModulePageSkeleton` from `@/components/module-page-skeleton`; `TagFilter`
  from `@/components/tag-filter`; `EmptyState` from `@/components/empty-state`.
- Produces: `ApisModuleContent` component (named export from
  `src/components/apis-module-content.tsx`), consumed by
  `src/app/apis/[slug]/page.tsx`. Its `componentMap` starts empty — later
  `/new-module` work adds entries the same way
  `games-module-content.tsx`/`utilities-module-content.tsx` do.

- [ ] **Step 1: Create `src/app/apis/page.tsx`**

```tsx
import { Suspense } from 'react'
import { getModulesByCategory } from '@/lib/registry'
import { TagFilter } from '@/components/tag-filter'
import { EmptyState } from '@/components/empty-state'
import { Plug } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'APIs' }

export default function ApisPage() {
  const modules = getModulesByCategory('apis')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <div className="mb-1.5 flex items-baseline gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">APIs</h1>
        <span className="text-sm text-muted-foreground">{modules.length}</span>
      </div>
      <p className="mb-8 text-muted-foreground">Fun and useful mini-apps powered by public APIs.</p>
      <Suspense>
        <TagFilter
          modules={modules}
          proposeHref="https://github.com/hoferan/miniyard/issues/new?template=new_apis_module.yml"
          proposeLabel="Propose a new API module"
          emptyState={
            <EmptyState
              icon={<Plug className="h-12 w-12" />}
              title="No API modules yet"
              description="API-powered tools are on the way. Check the open issues to see what's coming or suggest a new one."
              cta={{
                label: 'View open API issues',
                href: 'https://github.com/hoferan/miniyard/issues?q=label%3Aapis+is%3Aopen',
              }}
            />
          }
        />
      </Suspense>
    </main>
  )
}
```

- [ ] **Step 2: Create `src/app/apis/loading.tsx`**

```tsx
import { CategoryPageSkeleton } from '@/components/category-page-skeleton'

export default function Loading() {
  return <CategoryPageSkeleton />
}
```

- [ ] **Step 3: Create `src/components/apis-module-content.tsx`**

```tsx
'use client'

import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  // Add entries here as apis modules are created, e.g.:
  // 'weather-lookup': dynamic(() => import('@/modules/apis/weather-lookup'), { loading: ModuleSkeleton, ssr: false }),
}

export function ApisModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
```

Note: `ModuleSkeleton` is imported but unused until the first entry is added
to `componentMap` — this matches the file's purpose as a ready-to-extend
template, exactly mirroring `games-module-content.tsx`'s shape before it had
five entries.

- [ ] **Step 4: Create `src/app/apis/[slug]/page.tsx`**

```tsx
import { getModuleBySlug, getModulesByCategory } from '@/lib/registry'
import { notFound } from 'next/navigation'
import { ApisModuleContent } from '@/components/apis-module-content'
import { ModulePageLayout } from '@/components/module-page-layout'
import type { Metadata } from 'next'

export const dynamicParams = false

export function generateStaticParams() {
  return getModulesByCategory('apis').map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return {}
  return { title: mod.title, description: mod.description }
}

export default async function ApiModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return notFound()

  return (
    <ModulePageLayout mod={mod}>
      <ApisModuleContent slug={slug} />
    </ModulePageLayout>
  )
}
```

- [ ] **Step 5: Create `src/app/apis/[slug]/loading.tsx`**

```tsx
import { ModulePageSkeleton } from '@/components/module-page-skeleton'

export default function Loading() {
  return <ModulePageSkeleton />
}
```

- [ ] **Step 6: Typecheck and build**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build`
Expected: PASS. Build output must list `/apis` as a static/prerendered route.
Since `getModulesByCategory('apis')` returns `[]` right now,
`generateStaticParams` for `/apis/[slug]` returns an empty array — this is
valid and produces zero prerendered module pages, matching the "no modules
yet" state.

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, then in a browser visit `http://localhost:3000/apis`.
Expected: page renders with heading "APIs", count "0", description text, and
the `EmptyState` card ("No API modules yet") instead of a module grid.
Visit `http://localhost:3000/apis/anything` — expected: 404 page (no modules
exist, so no slug is valid).

- [ ] **Step 8: Commit**

```bash
git add src/app/apis src/components/apis-module-content.tsx
git commit -m "feat: add apis category routes"
```

---

### Task 4: Navigation wiring

**Files:**
- Modify: `src/lib/nav.ts`
- Modify: `src/components/layout/mobile-tab-bar.tsx`
- Modify: `src/components/home-search.tsx`

**Interfaces:**
- Consumes: `NAV_LINKS` (desktop header nav, from Task's own file), nothing
  new from other tasks.
- Produces: nothing new consumed by later tasks — this is a leaf wiring task.

- [ ] **Step 1: Update `src/lib/nav.ts`**

Replace full file contents with:

```ts
export const NAV_LINKS = [
  { href: '/utilities', label: 'Utilities' },
  { href: '/games', label: 'Games' },
  { href: '/apis', label: 'APIs' },
  { href: '/features', label: 'Labs' },
] as const
```

- [ ] **Step 2: Update `src/components/layout/mobile-tab-bar.tsx`**

Change the import line:

```tsx
import { Home, Wrench, Gamepad2, FlaskConical } from 'lucide-react'
```

to:

```tsx
import { Home, Wrench, Gamepad2, Plug, FlaskConical } from 'lucide-react'
```

Add an `apisActive` check alongside the existing ones — change:

```tsx
  const gamesActive = pathname === '/games' || pathname.startsWith('/games/')
  const labsActive = pathname === '/features'
```

to:

```tsx
  const gamesActive = pathname === '/games' || pathname.startsWith('/games/')
  const apisActive = pathname === '/apis' || pathname.startsWith('/apis/')
  const labsActive = pathname === '/features'
```

Add a new tab link between the "Games" `Link` block and the "Labs" `Link`
block — insert:

```tsx
      <Link
        href="/apis"
        aria-label="APIs"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          apisActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <Plug className="h-5 w-5" />
        <span className="text-[10px] font-semibold">APIs</span>
      </Link>
```

- [ ] **Step 3: Update `src/components/home-search.tsx`**

Change the `CATEGORIES` array — from:

```tsx
const CATEGORIES: {
  key: ModuleCategory
  label: string
  href: string
  proposeHref: string
  proposeLabel: string
}[] = [
  {
    key: 'utilities',
    label: 'Utilities',
    href: '/utilities',
    proposeHref: 'https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml',
    proposeLabel: 'Propose a new utility',
  },
  {
    key: 'games',
    label: 'Games',
    href: '/games',
    proposeHref: 'https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml',
    proposeLabel: 'Propose a new game',
  },
]
```

to:

```tsx
const CATEGORIES: {
  key: ModuleCategory
  label: string
  href: string
  proposeHref: string
  proposeLabel: string
}[] = [
  {
    key: 'utilities',
    label: 'Utilities',
    href: '/utilities',
    proposeHref: 'https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml',
    proposeLabel: 'Propose a new utility',
  },
  {
    key: 'games',
    label: 'Games',
    href: '/games',
    proposeHref: 'https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml',
    proposeLabel: 'Propose a new game',
  },
  {
    key: 'apis',
    label: 'APIs',
    href: '/apis',
    proposeHref: 'https://github.com/hoferan/miniyard/issues/new?template=new_apis_module.yml',
    proposeLabel: 'Propose a new API module',
  },
]
```

Note: `home-search.tsx` already skips rendering a section when
`categoryModules.length === 0` (see the `if (categoryModules.length === 0)
return null` guard), so the home page will not show an empty "APIs" section
until the first `apis` module is registered — no further change needed
there.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Regression-check with existing E2E coverage**

Run: `npx playwright test homepage.spec.ts`
Expected: PASS.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`. On desktop width, confirm the header nav shows
Utilities / Games / APIs / Labs in that order and each link navigates
correctly. On mobile width (or Playwright's mobile viewport), confirm the
bottom tab bar shows Home / Utilities / Games / APIs / Labs with the plug
icon, and that the current tab highlights correctly on `/apis`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/nav.ts src/components/layout/mobile-tab-bar.tsx src/components/home-search.tsx
git commit -m "feat: wire apis category into navigation"
```

---

### Task 5: GitHub issue/PR templates

**Files:**
- Create: `.github/ISSUE_TEMPLATE/new_apis_module.yml`
- Modify: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Modify: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Modify: `.github/PULL_REQUEST_TEMPLATE.md`

**Interfaces:** none — these are GitHub-native YAML/Markdown files, not
imported by any TypeScript code.

- [ ] **Step 1: Create `.github/ISSUE_TEMPLATE/new_apis_module.yml`**

```yaml
name: 🔌 New API Module
description: Idea for a new module powered by a public API
labels: ["new-module", "apis"]
body:
  - type: input
    id: name
    attributes:
      label: Module name
      placeholder: "e.g. Weather Lookup, Currency Converter, Random Joke"
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: What should the module do?
    validations:
      required: true
  - type: input
    id: api
    attributes:
      label: Which external API will it use?
      placeholder: "e.g. OpenWeatherMap — link to docs: https://openweathermap.org/api"
    validations:
      required: true
  - type: dropdown
    id: auth
    attributes:
      label: Does the API require an API key?
      options:
        - "No — public, keyless"
        - "Yes — requires a free API key"
        - "Yes — requires a paid API key"
        - "Not sure yet"
    validations:
      required: true
  - type: textarea
    id: inputs
    attributes:
      label: Inputs
      placeholder: |
        - City name
        - Units (metric / imperial)
    validations:
      required: true
  - type: textarea
    id: outputs
    attributes:
      label: Output / Result
      placeholder: |
        - Current temperature
        - Condition (sunny, rainy, ...)
    validations:
      required: true
  - type: dropdown
    id: complexity
    attributes:
      label: Estimated complexity
      options:
        - Small (< 2h)
        - Medium (2–6h)
        - Large (> 6h)
    validations:
      required: true
```

- [ ] **Step 2: Update `.github/ISSUE_TEMPLATE/bug_report.yml`**

Change the `category` dropdown options — from:

```yaml
      options:
        - Utility Tool
        - Minigame
        - Navigation / Layout
        - Other
```

to:

```yaml
      options:
        - Utility Tool
        - Minigame
        - API Module
        - Navigation / Layout
        - Other
```

- [ ] **Step 3: Update `.github/ISSUE_TEMPLATE/feature_request.yml`**

Change the `category` dropdown options — from:

```yaml
      options:
        - Existing Utility Tool
        - Existing Minigame
        - UI / UX
        - Performance
        - Other
```

to:

```yaml
      options:
        - Existing Utility Tool
        - Existing Minigame
        - Existing API Module
        - UI / UX
        - Performance
        - Other
```

- [ ] **Step 4: Update `.github/PULL_REQUEST_TEMPLATE.md`**

Change the "Type" checklist — from:

```markdown
## Type

<!-- Check all that apply -->
- [ ] 🔧 New Utility Tool
- [ ] 🎮 New Minigame
- [ ] 🗂️ New Category
- [ ] ✨ Improvement / Feature
- [ ] 🐛 Bug fix
- [ ] 🧹 Refactor / Cleanup
- [ ] 📚 Docs / Config
```

to:

```markdown
## Type

<!-- Check all that apply -->
- [ ] 🔧 New Utility Tool
- [ ] 🎮 New Minigame
- [ ] 🔌 New API Module
- [ ] 🗂️ New Category
- [ ] ✨ Improvement / Feature
- [ ] 🐛 Bug fix
- [ ] 🧹 Refactor / Cleanup
- [ ] 📚 Docs / Config
```

- [ ] **Step 5: Lint markdown**

Run: `npm run lint:md`
Expected: PASS (0 errors).

- [ ] **Step 6: Commit**

```bash
git add .github/ISSUE_TEMPLATE/new_apis_module.yml .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/PULL_REQUEST_TEMPLATE.md
git commit -m "chore: add apis category to GitHub issue and PR templates"
```

---

### Task 6: Documentation and Lighthouse config

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `.lighthouserc.json`

**Interfaces:** none — documentation and CI config only.

- [ ] **Step 1: Update `README.md`**

Add a new category section after the "🎮 Games" table and before the closing
`---` that precedes "## Tech Stack". Insert:

```markdown
### 🔌 APIs
<!-- Add API-powered modules here as they are built -->
| Module | Description |
|------|-------------|
```

(Empty table body — no `apis` modules exist yet. Matches how each category
table started before its first module was added.)

- [ ] **Step 2: Update `CLAUDE.md` categories table**

Change:

```markdown
| Category | Description | Path |
|---|---|---|
| **Utilities** | Calculators, converters, text tools, math functions | `src/modules/utilities/` |
| **Games** | Browser games, mobile-first | `src/modules/games/` |
```

to:

```markdown
| Category | Description | Path |
|---|---|---|
| **Utilities** | Calculators, converters, text tools, math functions | `src/modules/utilities/` |
| **Games** | Browser games, mobile-first | `src/modules/games/` |
| **APIs** | Mini-apps powered by public third-party APIs, proxied through server-side Route Handlers | `src/modules/apis/` |
```

- [ ] **Step 3: Update `CLAUDE.md` project structure tree**

In the `Project Structure` code block, after the `games/` subtree (the block
ending with `messages.ts             # (optional) User-facing strings`
under `games/`) and before `components/`, add:

```text
    apis/
      README.md                 # Category definition – what belongs here, brainstorm questions
      <name>/
        index.tsx               # React UI component
        meta.ts                 # Module metadata (slug, title, tags, createdAt)
        api.ts                  # Client-side fetch wrapper — calls this app's own proxy route
        logic.ts                # Pure logic – no React, no DOM, no fetch
        logic.test.ts           # Vitest unit tests
        messages.ts             # User-facing strings – loading/error/empty states
```

Also, in the `app/` subtree near the top of the same code block (alongside
the existing `utilities/` and `games/` route entries), add:

```text
    apis/
      page.tsx                  # Category listing page
      loading.tsx               # Category loading boundary
      [slug]/page.tsx           # Individual module page (statically generated)
      [slug]/loading.tsx        # Module loading boundary
    api/
      apis/
        <slug>/route.ts         # Server-side proxy Route Handler per apis module (added per module)
```

And in the `components/` subtree, alongside
`utilities-module-content.tsx` / `games-module-content.tsx`, add:

```text
    apis-module-content.tsx       # componentMap + dynamic imports for apis
```

- [ ] **Step 4: Update `.lighthouserc.json`**

Add the new category listing URL to the `collect.url` array — from:

```json
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/utilities",
        "http://localhost:3000/utilities/unit-converter",
        "http://localhost:3000/games",
        "http://localhost:3000/games/memory-card"
      ],
```

to:

```json
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/utilities",
        "http://localhost:3000/utilities/unit-converter",
        "http://localhost:3000/games",
        "http://localhost:3000/games/memory-card",
        "http://localhost:3000/apis"
      ],
```

Do **not** add a representative `apis` module URL yet — no `apis` module
exists in this plan (that's explicitly out of scope, see the design spec).
Add the module URL as part of the first `/new-module` PR in this category,
the same way `/games/memory-card` was added when the first game shipped.

- [ ] **Step 5: Lint markdown**

Run: `npm run lint:md`
Expected: PASS (0 errors).

- [ ] **Step 6: Commit**

```bash
git add README.md CLAUDE.md .lighthouserc.json
git commit -m "docs: document apis category in README, CLAUDE.md, and lighthouse config"
```

---

### Task 7: Final verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 2: Full lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Full unit test suite**

Run: `npm run test`
Expected: PASS, no regressions in `src/lib/registry.test.ts` or any module
`logic.test.ts`.

- [ ] **Step 4: Full build**

Run: `npm run build`
Expected: PASS. `/apis` and (zero) `/apis/[slug]` routes appear in the build
output alongside the existing `utilities`/`games` routes.

- [ ] **Step 5: Full E2E suite**

Run: `npm run test:e2e`
Expected: PASS, no regressions (in particular `homepage.spec.ts`,
`module-card.spec.ts`, `pwa.spec.ts`).

- [ ] **Step 6: Manual click-through**

Run: `npm run dev`. Confirm:
- `/apis` renders the empty state with correct heading, count "0", and
  description.
- Header nav and mobile tab bar both show and correctly link to APIs.
- `/apis/anything` 404s.
- Home page does not show an "APIs" section (no modules registered yet).

- [ ] **Step 7: Markdown lint (repo-wide)**

Run: `npm run lint:md`
Expected: PASS (0 errors) across all changed `.md`/`.yml` documentation.
