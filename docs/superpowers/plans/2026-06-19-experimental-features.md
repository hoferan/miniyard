# Experimental Features System + Tag-Based Module Filtering

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localStorage-persisted experimental feature flag system (a `/features` Labs page with toggleable switches), then ship tag-based module filtering as the first feature behind it.

**Architecture:** A central registry (`src/lib/features.ts`) defines all experimental features. A React context provider (`src/components/features-provider.tsx`) wraps the app, reads localStorage on mount, and exposes `useFeatureFlag(id)`. The `/features` page lists every feature with a shadcn Switch. Category pages render a shared `<TagFilter>` component that reads the flag and conditionally shows tag chips + filtered grid.

**Tech Stack:** Next.js 14 App Router, React context, localStorage, shadcn/ui Badge + Switch, `useSearchParams` + `useRouter` + `usePathname` from `next/navigation`, Playwright E2E.

## Global Constraints

- TypeScript strict mode — no `any`
- Functional components only — `'use client'` only when needed (hooks, browser APIs)
- Tailwind utility classes — no inline styles
- All content in English
- Exact npm version pins — no `^` or `~` prefixes; strip them after `npm install`
- Conventional Commits — `feat:`, `chore:`, `docs:`, `test:`
- Never push to `main` — work on `issue-11-tag-filtering`
- Fenced code blocks in `.md` files must have a language identifier (MD040)

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `src/lib/features.ts` | **Create** | Feature type + FEATURES registry array |
| `src/components/features-provider.tsx` | **Create** | React context, localStorage read/write, `useFeatureFlag` hook |
| `src/components/ui/switch.tsx` | **Create** | shadcn Switch component (fetch from GitHub) |
| `src/app/features/page.tsx` | **Create** | `/features` (Labs) page — lists features with toggles |
| `src/components/tag-filter.tsx` | **Create** | Tag chips + filtered module grid, gated behind `useFeatureFlag('tag-filter')` |
| `tests/e2e/features.spec.ts` | **Create** | E2E tests for the full flag → filter flow |
| `src/app/layout.tsx` | **Modify** | Add `<FeaturesProvider>` wrapper |
| `src/app/utilities/page.tsx` | **Modify** | Replace inline grid with `<Suspense><TagFilter /></Suspense>` |
| `src/app/games/page.tsx` | **Modify** | Replace inline grid with `<Suspense><TagFilter /></Suspense>` |
| `src/components/layout/header.tsx` | **Modify** | Add "Labs" nav link |
| `src/components/layout/mobile-tab-bar.tsx` | **Modify** | Add Labs tab (🧪) |
| `CLAUDE.md` | **Modify** | Document the experimental features pattern |

---

### Task 1: Feature flag definitions and provider

**Files:**
- Create: `src/lib/features.ts`
- Create: `src/components/features-provider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces:
  - `Feature` type with fields `id`, `title`, `description`, `defaultEnabled`
  - `FEATURES: Feature[]` — the registry
  - `FeaturesProvider` component
  - `useFeatures(): { flags, setFlag }` hook
  - `useFeatureFlag(id: string): boolean` hook

- [ ] **Step 1: Create `src/lib/features.ts`**

```ts
export type Feature = {
  id: string
  title: string
  description: string
  defaultEnabled: boolean
}

export const FEATURES: Feature[] = [
  {
    id: 'tag-filter',
    title: 'Tag-based module filtering',
    description:
      'Adds tag chips to category pages. Click a tag to filter the module grid in real time. Active tag syncs with the URL so filtered views are bookmarkable.',
    defaultEnabled: false,
  },
]
```

- [ ] **Step 2: Create `src/components/features-provider.tsx`**

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'

type FlagsState = Record<string, boolean>

type FeaturesContextValue = {
  flags: FlagsState
  setFlag: (id: string, enabled: boolean) => void
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null)

const STORAGE_KEY = 'miniyard-features'

function defaultFlags(): FlagsState {
  return Object.fromEntries(FEATURES.map((f) => [f.id, f.defaultEnabled]))
}

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FlagsState>(defaultFlags)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setFlags((prev) => ({ ...prev, ...(JSON.parse(raw) as FlagsState) }))
    } catch {
      // ignore malformed storage
    }
  }, [])

  function setFlag(id: string, enabled: boolean) {
    setFlags((prev) => {
      const next = { ...prev, [id]: enabled }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return <FeaturesContext.Provider value={{ flags, setFlag }}>{children}</FeaturesContext.Provider>
}

export function useFeatures() {
  const ctx = useContext(FeaturesContext)
  if (!ctx) throw new Error('useFeatures must be used inside FeaturesProvider')
  return ctx
}

export function useFeatureFlag(id: string): boolean {
  const { flags } = useFeatures()
  return flags[id] ?? false
}
```

- [ ] **Step 3: Add `FeaturesProvider` to `src/app/layout.tsx`**

Add this import at the top:

```tsx
import { FeaturesProvider } from '@/components/features-provider'
```

Wrap the inner `<div>` inside `<ThemeProvider>`:

```tsx
<ThemeProvider>
  <FeaturesProvider>
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ... existing content unchanged ... */}
    </div>
  </FeaturesProvider>
</ThemeProvider>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/features.ts src/components/features-provider.tsx src/app/layout.tsx
git commit -m "feat: add experimental feature flag system with localStorage persistence"
```

---

### Task 2: shadcn Switch component

**Files:**
- Create: `src/components/ui/switch.tsx`

**Interfaces:**
- Produces: `Switch` component with props `checked: boolean`, `onCheckedChange: (checked: boolean) => void`, `aria-label: string`

- [ ] **Step 1: Fetch the Switch component from the shadcn GitHub repository**

Fetch the raw file from:
`https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/new-york/ui/switch.tsx`

Write the contents exactly to `src/components/ui/switch.tsx`.

- [ ] **Step 2: Check for missing package dependencies**

Inspect the imports in `src/components/ui/switch.tsx`. It will reference `@radix-ui/react-switch`.

Check if it is already in `package.json`:

```bash
grep "react-switch" package.json
```

If absent, install with an exact version:

```bash
npm install @radix-ui/react-switch
```

Then open `package.json` and remove the `^` from the installed version (Dependabot handles upgrades).

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/switch.tsx package.json package-lock.json
git commit -m "chore: add shadcn Switch component"
```

---

### Task 3: /features page

**Files:**
- Create: `src/app/features/page.tsx`

**Interfaces:**
- Consumes: `FEATURES` from `@/lib/features`; `useFeatures` from `@/components/features-provider`; `Switch` from `@/components/ui/switch`

- [ ] **Step 1: Create `src/app/features/page.tsx`**

```tsx
'use client'

import { FEATURES } from '@/lib/features'
import { useFeatures } from '@/components/features-provider'
import { Switch } from '@/components/ui/switch'

export default function FeaturesPage() {
  const { flags, setFlag } = useFeatures()

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Labs</h1>
      <p className="mb-8 text-muted-foreground">
        Experimental features you can try out. Settings are saved in this browser.
      </p>

      <div className="flex flex-col gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="flex items-start justify-between gap-6 rounded-[18px] border border-white/90 bg-white/70 p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div>
              <p className="font-semibold text-foreground">{feature.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{feature.description}</p>
            </div>
            <Switch
              checked={flags[feature.id] ?? feature.defaultEnabled}
              onCheckedChange={(checked) => setFlag(feature.id, checked)}
              aria-label={`Toggle ${feature.title}`}
            />
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Start the dev server (`npm run dev`) and open `http://localhost:3000/features`.

Expected:
- Page heading "Labs" visible
- "Tag-based module filtering" card with a Switch toggle
- Toggle is off by default
- Toggling on: reload the page → toggle remains on (localStorage key `miniyard-features` holds `{"tag-filter":true}`)
- Toggling off: reload → toggle is off again

- [ ] **Step 4: Commit**

```bash
git add src/app/features/page.tsx
git commit -m "feat: add /features Labs page for toggling experimental features"
```

---

### Task 4: TagFilter component

**Files:**
- Create: `src/components/tag-filter.tsx`

**Interfaces:**
- Consumes: `Module` from `@/lib/types`; `useFeatureFlag` from `@/components/features-provider`; `useSearchParams`, `useRouter`, `usePathname` from `next/navigation`; `Badge` from `@/components/ui/badge`; `ModuleCard` from `@/components/module-card`; `cn` from `@/lib/utils`
- Produces: `TagFilter({ modules: Module[], emptyState?: React.ReactNode })` — when the flag is off renders a plain grid; when on renders tag chips above the filtered grid

- [ ] **Step 1: Create `src/components/tag-filter.tsx`**

```tsx
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ModuleCard } from '@/components/module-card'
import { useFeatureFlag } from '@/components/features-provider'
import type { Module } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  modules: Module[]
  emptyState?: React.ReactNode
}

export function TagFilter({ modules, emptyState }: Props) {
  const tagFilterEnabled = useFeatureFlag('tag-filter')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTag = tagFilterEnabled ? searchParams.get('tag') : null

  const allTags = Array.from(new Set(modules.flatMap((m) => m.tags))).sort()
  const filtered =
    tagFilterEnabled && activeTag ? modules.filter((m) => m.tags.includes(activeTag)) : modules

  function selectTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeTag === tag) {
      params.delete('tag')
    } else {
      params.set('tag', tag)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  if (modules.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div>
      {tagFilterEnabled && allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => selectTag(tag)}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Badge
                variant={activeTag === tag ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer select-none',
                  activeTag !== tag && 'hover:bg-secondary',
                )}
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No modules match the &ldquo;{activeTag}&rdquo; tag.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tag-filter.tsx
git commit -m "feat: add TagFilter component gated behind tag-filter feature flag"
```

---

### Task 5: Wire TagFilter into category pages

**Files:**
- Modify: `src/app/utilities/page.tsx`
- Modify: `src/app/games/page.tsx`

**Interfaces:**
- Consumes: `TagFilter` from `@/components/tag-filter`; `Suspense` from `react`; `EmptyState` from `@/components/empty-state`

- [ ] **Step 1: Replace `src/app/utilities/page.tsx`**

```tsx
import { Suspense } from 'react'
import { getModulesByCategory } from '@/lib/registry'
import { TagFilter } from '@/components/tag-filter'

export default function UtilitiesPage() {
  const modules = getModulesByCategory('utilities')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Tools</h1>
      <p className="mb-8 text-muted-foreground">Handy tools for everyday tasks.</p>
      <Suspense>
        <TagFilter modules={modules} />
      </Suspense>
    </main>
  )
}
```

- [ ] **Step 2: Replace `src/app/games/page.tsx`**

```tsx
import { Suspense } from 'react'
import { getModulesByCategory } from '@/lib/registry'
import { TagFilter } from '@/components/tag-filter'
import { EmptyState } from '@/components/empty-state'

export default function GamesPage() {
  const modules = getModulesByCategory('games')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Games</h1>
      <p className="mb-8 text-muted-foreground">Mini games to pass the time.</p>
      <Suspense>
        <TagFilter
          modules={modules}
          emptyState={
            <EmptyState
              icon="🎮"
              title="No games yet"
              description="Games are on the way. Check the open issues to see what's coming or suggest a new one."
              cta={{
                label: 'View open game issues',
                href: 'https://github.com/hoferan/miniyard/issues?q=label%3Aminigame+is%3Aopen',
              }}
            />
          }
        />
      </Suspense>
    </main>
  )
}
```

- [ ] **Step 3: Verify — feature off behaves exactly like before**

With dev server running (`npm run dev`) and `miniyard-features` cleared from localStorage:
- `/utilities` — plain grid, no tag chips visible
- `/games` — plain grid, no tag chips visible

Enable the feature at `/features`, then:
- `/utilities` — tag chip row appears above the grid
- Click `math` — grid shows only Unit Converter; URL is `/utilities?tag=math`
- Click `math` again — filter clears; URL returns to `/utilities`
- `/features` — toggle the feature OFF
- `/utilities` — tag chips gone, plain grid back

- [ ] **Step 4: Verify TypeScript and build**

```bash
npm run typecheck && npm run build
```

Expected: no errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/utilities/page.tsx src/app/games/page.tsx
git commit -m "feat: wire TagFilter into category listing pages"
```

---

### Task 6: Nav links to /features

**Files:**
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/mobile-tab-bar.tsx`

- [ ] **Step 1: Add "Labs" to the desktop header nav**

In `src/components/layout/header.tsx`, update `NAV_LINKS`:

```tsx
const NAV_LINKS = [
  { href: '/utilities', label: 'Tools' },
  { href: '/games', label: 'Games' },
  { href: '/features', label: 'Labs' },
]
```

- [ ] **Step 2: Replace `src/components/layout/mobile-tab-bar.tsx`**

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function MobileTabBar() {
  const pathname = usePathname()
  const toolsActive = pathname.startsWith('/utilities')
  const gamesActive = pathname === '/games' || pathname.startsWith('/games/')
  const labsActive = pathname === '/features'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex h-[70px] items-start border-t border-border bg-background/80 px-6 pt-3 backdrop-blur-xl md:hidden dark:bg-background/70">
      <Link
        href="/utilities"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          toolsActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <span className="text-xl">🧰</span>
        <span className="text-[10px] font-semibold">Tools</span>
      </Link>
      <Link
        href="/games"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          gamesActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <span className="text-xl">🎮</span>
        <span className="text-[10px] font-semibold">Games</span>
      </Link>
      <Link
        href="/features"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          labsActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <span className="text-xl">🧪</span>
        <span className="text-[10px] font-semibold">Labs</span>
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Verify nav links**

With dev server running:
- Desktop: "Labs" link appears in the header between "Games" and the theme toggle; clicking navigates to `/features`
- Mobile (DevTools → responsive mode): 🧪 Labs tab appears in the bottom bar; active state highlights in primary colour when on `/features`

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/mobile-tab-bar.tsx
git commit -m "feat: add Labs nav link to header and mobile tab bar"
```

---

### Task 7: E2E test

**Files:**
- Create: `tests/e2e/features.spec.ts`

- [ ] **Step 1: Create `tests/e2e/features.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test.describe('Experimental features — tag filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('miniyard-features'))
  })

  test('tag chips are hidden by default on the Tools page', async ({ page }) => {
    await page.goto('/utilities')
    await expect(page.getByRole('button', { name: 'units' })).not.toBeVisible()
    await page.screenshot({
      path: 'tests/e2e/screenshots/tag-filter-disabled.png',
      fullPage: true,
    })
  })

  test('tag chips appear after enabling the feature on the Labs page', async ({ page }) => {
    await page.goto('/features')
    await page.getByRole('switch', { name: /tag-based module filtering/i }).click()
    await page.goto('/utilities')
    await expect(page.getByRole('button', { name: 'units' })).toBeVisible()
    await page.screenshot({
      path: 'tests/e2e/screenshots/tag-filter-enabled.png',
      fullPage: true,
    })
  })

  test('clicking a tag filters the grid and updates the URL', async ({ page }) => {
    await page.evaluate(() =>
      localStorage.setItem('miniyard-features', JSON.stringify({ 'tag-filter': true })),
    )
    await page.goto('/utilities')
    await page.getByRole('button', { name: 'math' }).click()
    await expect(page.url()).toContain('?tag=math')
    await expect(page.getByText('Unit Converter')).toBeVisible()
    await expect(page.getByText('Base64 Encoder')).not.toBeVisible()
  })

  test('clicking the active tag clears the filter', async ({ page }) => {
    await page.evaluate(() =>
      localStorage.setItem('miniyard-features', JSON.stringify({ 'tag-filter': true })),
    )
    await page.goto('/utilities?tag=math')
    await page.getByRole('button', { name: 'math' }).click()
    await expect(page.url()).not.toContain('tag=')
    await expect(page.getByText('Base64 Encoder')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the E2E tests**

```bash
npm run test:e2e
```

Expected: all 4 tests pass; screenshots saved to `tests/e2e/screenshots/`.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/features.spec.ts
git commit -m "test: add E2E tests for experimental tag-filter feature flag"
```

---

### Task 8: Document the experimental features pattern in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add "Experimental Features" section to CLAUDE.md**

Insert the following section after the `## Testing` section (before `## Context Management`):

````markdown
## Experimental Features

miniyard uses a lightweight, localStorage-based feature flag system to ship experimental functionality safely. All experimental features are opt-in — users enable them on the `/features` (Labs) page. Settings persist per browser; production and deploy previews always run the same code.

### System files

| File | Role |
|---|---|
| `src/lib/features.ts` | Central registry — defines every experimental feature (`id`, `title`, `description`, `defaultEnabled`) |
| `src/components/features-provider.tsx` | React context — reads localStorage on mount, exposes `useFeatureFlag(id)` to any client component |
| `src/app/features/page.tsx` | The `/features` (Labs) page — lists all features with toggle switches automatically |

### How to add a new experimental feature

1. Add an entry to `FEATURES` in `src/lib/features.ts`:

   ```ts
   {
     id: 'my-feature',
     title: 'Human-readable title',
     description: 'One sentence explaining what this does.',
     defaultEnabled: false,
   }
   ```

2. Gate the new behaviour in the relevant client component with `useFeatureFlag`:

   ```tsx
   import { useFeatureFlag } from '@/components/features-provider'

   const myFeatureEnabled = useFeatureFlag('my-feature')
   ```

3. The feature automatically appears on `/features` — no page edits needed.

### Graduating a feature to stable

When a feature is ready to ship to everyone: remove its entry from `FEATURES` in `src/lib/features.ts` and remove the `useFeatureFlag` guard from the component. Do not leave dead flags in the registry.

### Conventions

- All new features have `defaultEnabled: false`
- Feature `id` values are `kebab-case`
- Descriptions are one sentence, present tense, user-facing (e.g. "Adds tag chips to category pages.")
- Never use env vars to gate experimental features — localStorage keeps prod and preview identical
````

- [ ] **Step 2: Run the markdown linter**

```bash
npm run lint:md
```

Expected: no errors. Every fenced code block must have a language identifier.

- [ ] **Step 3: Run the full test suite**

```bash
npm run test && npm run typecheck && npm run build
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document experimental features pattern in CLAUDE.md"
```

---

## Self-review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| `/features` Labs page with toggles | Task 3 |
| localStorage persistence | Task 1 (provider) + Task 3 (page) |
| Tag chips below category heading | Task 4 (TagFilter) + Task 5 (pages) |
| Real-time grid filtering | Task 4 |
| URL sync (`?tag=`) | Task 4 |
| Clicking active tag clears filter | Task 4 |
| Shared `<TagFilter>` reused on both pages | Task 4 + Task 5 |
| shadcn Badge for chips | Task 4 |
| `useSearchParams` + `useRouter` for URL state | Task 4 |
| "Labs" link in desktop nav | Task 6 |
| "Labs" tab in mobile tab bar | Task 6 |
| CLAUDE.md documents the pattern | Task 8 |
| E2E tests | Task 7 |
| TypeScript + build green | Tasks 1, 2, 3, 4, 5 each verify |

**No placeholders found.**

**Type consistency:** `Feature` defined in Task 1, consumed in Tasks 2, 3. `FlagsState = Record<string, boolean>` used consistently. `TagFilter` props defined and consumed consistently across Tasks 4 and 5. `useFeatureFlag(id: string): boolean` signature consistent across Tasks 1 and 4.
