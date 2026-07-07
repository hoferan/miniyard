# Module List Scalability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cap the home page to 5 newest modules per category (with a show-more tile), add batched "Load more" pagination to category pages, and add a trailing "propose a new module on GitHub" card wherever a module list reaches its end.

**Architecture:** A pure sort helper (`sortModulesByNewest`) in the existing registry module drives home-page ordering. Two new presentational components (`ShowMoreCard`, `ProposeModuleCard`) reuse `ModuleCard`'s visual shell and slot into the existing grids in `home-search.tsx` (home page) and `tag-filter.tsx` (category pages). Category-page "Load more" is local `useState` batching — no URL state, no new dependencies.

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, lucide-react icons, Vitest, Playwright.

## Global Constraints

- Home page preview cap: 5 modules per category, newest first (`createdAt` descending, stable sort).
- Category page batch size: 9 modules per "Load more" click.
- Category-page pagination is local component state only — no URL/query-param persistence; a reload always resets to the first batch.
- `ProposeModuleCard` always opens its link in a new tab: `target="_blank" rel="noopener noreferrer"`.
- GitHub issue template URLs (hardcoded at call sites, no new shared constants module, matching the existing convention in `src/app/games/page.tsx`):
  - Utilities: `https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml`
  - Games: `https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml`
- TypeScript strict mode, no `any`; functional components only; Tailwind utility classes only, no inline styles.
- No new npm packages.
- Commits use Conventional Commits (`feat:`, `test:`, etc.).
- Spec reference: `docs/superpowers/specs/2026-07-07-module-list-scalability-design.md`.

---

### Task 1: `sortModulesByNewest` helper in the registry

**Files:**
- Modify: `src/lib/registry.ts`
- Test: `src/lib/registry.test.ts` (new)

**Interfaces:**
- Consumes: `Module` type from `src/lib/types.ts` (`slug`, `title`, `description`, `category`, `tags`, `createdAt`, `icon?`).
- Produces: `export function sortModulesByNewest(modules: Module[]): Module[]` — returns a **new** array (does not mutate input), sorted by `createdAt` descending, stable for ties. Consumed by Task 4 (`home-search.tsx`).

- [ ] **Step 1: Write the failing test**

Create `src/lib/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { sortModulesByNewest } from './registry'
import type { Module } from './types'

function makeModule(overrides: Partial<Module> & Pick<Module, 'slug' | 'createdAt'>): Module {
  return {
    title: 'Test Module',
    description: 'A test module',
    category: 'utilities',
    tags: [],
    ...overrides,
  }
}

describe('sortModulesByNewest', () => {
  it('sorts modules newest first', () => {
    const older = makeModule({ slug: 'older', createdAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeModule({ slug: 'newer', createdAt: '2026-03-01T00:00:00.000Z' })
    const middle = makeModule({ slug: 'middle', createdAt: '2026-02-01T00:00:00.000Z' })

    const result = sortModulesByNewest([older, newer, middle])

    expect(result.map((m) => m.slug)).toEqual(['newer', 'middle', 'older'])
  })

  it('preserves original relative order for modules with identical createdAt', () => {
    const first = makeModule({ slug: 'first', createdAt: '2026-01-01T00:00:00.000Z' })
    const second = makeModule({ slug: 'second', createdAt: '2026-01-01T00:00:00.000Z' })

    const result = sortModulesByNewest([first, second])

    expect(result.map((m) => m.slug)).toEqual(['first', 'second'])
  })

  it('does not mutate the input array', () => {
    const older = makeModule({ slug: 'older', createdAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeModule({ slug: 'newer', createdAt: '2026-02-01T00:00:00.000Z' })
    const input = [older, newer]

    sortModulesByNewest(input)

    expect(input.map((m) => m.slug)).toEqual(['older', 'newer'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- registry.test.ts`
Expected: FAIL — `sortModulesByNewest` is not exported from `./registry`.

- [ ] **Step 3: Implement `sortModulesByNewest`**

In `src/lib/registry.ts`, add this export (after the existing `getModuleBySlug` function, at the end of the file):

```ts
export function sortModulesByNewest(modules: Module[]): Module[] {
  return [...modules].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- registry.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/registry.ts src/lib/registry.test.ts
git commit -m "feat: add sortModulesByNewest helper to registry"
```

---

### Task 2: `ShowMoreCard` component

**Files:**
- Create: `src/components/show-more-card.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `Link` from `next/link`; `ArrowRight` from `lucide-react`.
- Produces: `export function ShowMoreCard({ href, remaining }: { href: string; remaining: number }): JSX.Element`. Caller contract: only render this component when `remaining > 0`. Consumed by Task 4 (`home-search.tsx`).

- [ ] **Step 1: Create the component**

Create `src/components/show-more-card.tsx`:

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { href: string; remaining: number }

export function ShowMoreCard({ href, remaining }: Props) {
  return (
    <Link href={href}>
      <div
        className={cn(
          'group relative flex h-full cursor-pointer flex-col justify-center rounded-[22px] p-6',
          'border border-white/90 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]',
          'shadow-[0_10px_26px_-14px_rgba(90,70,160,.45)] dark:shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)]',
          'transition-all duration-300',
          'hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_26px_52px_-22px_rgba(124,108,255,.5)]',
        )}
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 dark:bg-primary/15">
          <ArrowRight className="h-5 w-5" />
        </div>
        <div className="mb-1.5 text-[18px] font-bold text-foreground">+{remaining} more</div>
        <p className="text-[13.5px] leading-[1.5] text-muted-foreground">View all in this category</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/show-more-card.tsx
git commit -m "feat: add ShowMoreCard component"
```

---

### Task 3: `ProposeModuleCard` component

**Files:**
- Create: `src/components/propose-module-card.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `ExternalLink` from `lucide-react`.
- Produces: `export function ProposeModuleCard({ href, label }: { href: string; label: string }): JSX.Element`. Consumed by Task 5 (`home-search.tsx`) and Task 7 (`tag-filter.tsx`).

- [ ] **Step 1: Create the component**

Create `src/components/propose-module-card.tsx`:

```tsx
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { href: string; label: string }

export function ProposeModuleCard({ href, label }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      className={cn(
        'group relative flex h-full cursor-pointer flex-col justify-center rounded-[22px] p-6',
        'border border-white/90 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]',
        'shadow-[0_10px_26px_-14px_rgba(90,70,160,.45)] dark:shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)]',
        'transition-all duration-300',
        'hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_26px_52px_-22px_rgba(124,108,255,.5)]',
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 dark:bg-primary/15">
        <ExternalLink className="h-5 w-5" />
      </div>
      <div className="mb-1.5 text-[18px] font-bold text-foreground">{label}</div>
      <p className="text-[13.5px] leading-[1.5] text-muted-foreground">Suggest it as a GitHub issue.</p>
    </a>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/propose-module-card.tsx
git commit -m "feat: add ProposeModuleCard component"
```

---

### Task 4: Failing E2E test for the home page propose links

**Files:**
- Create: `tests/e2e/propose-module-card.spec.ts`

**Interfaces:**
- Consumes: nothing from prior tasks (targets rendered HTML directly by URL).
- Produces: an E2E spec file that Task 6 will extend with two more tests.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/propose-module-card.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('propose module card', () => {
  test('home page shows propose links for both categories', async ({ page }) => {
    await page.goto('/')

    const utilitiesLink = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml"]',
    )
    await expect(utilitiesLink).toBeVisible()
    await expect(utilitiesLink).toHaveAttribute('target', '_blank')
    await expect(utilitiesLink).toHaveAttribute('rel', 'noopener noreferrer')

    const gamesLink = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml"]',
    )
    await expect(gamesLink).toBeVisible()
    await expect(gamesLink).toHaveAttribute('target', '_blank')
    await expect(gamesLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test propose-module-card.spec.ts`
Expected: FAIL — neither link exists on the home page yet.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/propose-module-card.spec.ts
git commit -m "test: add failing E2E test for home page propose links"
```

---

### Task 5: Wire sorting, cap, `ShowMoreCard`, and `ProposeModuleCard` into the home page

**Files:**
- Modify: `src/components/home-search.tsx`

**Interfaces:**
- Consumes: `sortModulesByNewest` (Task 1), `ShowMoreCard` (Task 2), `ProposeModuleCard` (Task 3).
- Produces: the empty-query branch of `HomeSearch` now caps each category at 5 newest modules and appends `ShowMoreCard` (when needed) and `ProposeModuleCard`.

- [ ] **Step 1: Update imports and the `CATEGORIES` constant**

In `src/components/home-search.tsx`, replace the import block and `CATEGORIES` constant (lines 1–19):

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Module, ModuleCategory } from '@/lib/types'
import { sortModulesByNewest } from '@/lib/registry'
import { ModuleCard } from './module-card'
import { ShowMoreCard } from './show-more-card'
import { ProposeModuleCard } from './propose-module-card'

interface HomeSearchProps {
  modules: Module[]
}

const HOME_PREVIEW_LIMIT = 5

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

- [ ] **Step 2: Cap, sort, and append trailing tiles in the empty-query branch**

Still in `src/components/home-search.tsx`, replace the `CATEGORIES.map` block inside the `if (q === '')` branch:

```tsx
{CATEGORIES.map(({ key, label, href, proposeHref, proposeLabel }) => {
  const categoryModules = modules.filter((m) => m.category === key)
  if (categoryModules.length === 0) return null
  const visible = sortModulesByNewest(categoryModules).slice(0, HOME_PREVIEW_LIMIT)
  const remaining = categoryModules.length - HOME_PREVIEW_LIMIT
  return (
    <section key={key}>
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="text-xl font-bold tracking-tight">{label}</h2>
        <span className="text-sm text-muted-foreground">{categoryModules.length}</span>
        <Link
          href={href}
          className="ml-auto text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
        {remaining > 0 && <ShowMoreCard href={href} remaining={remaining} />}
        <ProposeModuleCard href={proposeHref} label={proposeLabel} />
      </div>
    </section>
  )
})}
```

(The search-results branch below — the `filtered.map(...)` block after `const q = query.trim().toLowerCase()` — is unchanged.)

- [ ] **Step 3: Run the E2E test to verify it passes**

Run: `npx playwright test propose-module-card.spec.ts`
Expected: PASS.

- [ ] **Step 4: Run typecheck and unit tests**

Run: `npm run typecheck && npm run test`
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home-search.tsx
git commit -m "feat: cap home page preview to 5 newest modules with show-more and propose tiles"
```

---

### Task 6: Failing E2E tests for category page propose links

**Files:**
- Modify: `tests/e2e/propose-module-card.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: two additional tests in the same `describe` block from Task 4.

- [ ] **Step 1: Write the failing tests**

In `tests/e2e/propose-module-card.spec.ts`, add these two tests inside the existing `test.describe('propose module card', ...)` block, after the home page test:

```ts
  test('utilities page shows a propose-a-utility link', async ({ page }) => {
    await page.goto('/utilities')

    const link = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml"]',
    )
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('games page shows a propose-a-game link', async ({ page }) => {
    await page.goto('/games')

    const link = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml"]',
    )
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
  })
```

- [ ] **Step 2: Run tests to verify the two new ones fail**

Run: `npx playwright test propose-module-card.spec.ts`
Expected: the home page test PASSes (from Task 5); the two new tests FAIL — neither category page renders the link yet.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/propose-module-card.spec.ts
git commit -m "test: add failing E2E tests for category page propose links"
```

---

### Task 7: Wire pagination and `ProposeModuleCard` into category pages

**Files:**
- Modify: `src/components/tag-filter.tsx`
- Modify: `src/app/utilities/page.tsx`
- Modify: `src/app/games/page.tsx`

**Interfaces:**
- Consumes: `ProposeModuleCard` (Task 3).
- Produces: `TagFilter` now requires `proposeHref: string` and `proposeLabel: string` props (breaking change to its prop signature — both call sites are updated in this same task).

- [ ] **Step 1: Add pagination state and the `proposeHref`/`proposeLabel` props**

Replace the full contents of `src/components/tag-filter.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModuleCard } from '@/components/module-card'
import { ProposeModuleCard } from '@/components/propose-module-card'
import { useFeatureFlag } from '@/components/features-provider'
import type { Module } from '@/lib/types'
import { cn } from '@/lib/utils'

const BATCH_SIZE = 9

type Props = {
  modules: Module[]
  emptyState?: React.ReactNode
  proposeHref: string
  proposeLabel: string
}

export function TagFilter({ modules, emptyState, proposeHref, proposeLabel }: Props) {
  const tagFilterEnabled = useFeatureFlag('tag-filter')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTag = tagFilterEnabled ? searchParams.get('tag') : null
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)

  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [activeTag])

  const allTags = Array.from(new Set(modules.flatMap((m) => m.tags))).sort()
  const filtered =
    tagFilterEnabled && activeTag ? modules.filter((m) => m.tags.includes(activeTag)) : modules
  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

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
            <Button
              key={tag}
              type="button"
              variant={activeTag === tag ? 'default' : 'outline'}
              onClick={() => selectTag(tag)}
              className={cn(
                'h-auto rounded-md px-2.5 py-0.5 text-xs font-semibold select-none',
                activeTag !== tag && 'hover:bg-secondary hover:text-secondary-foreground',
              )}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((module) => (
              <ModuleCard key={module.slug} module={module} />
            ))}
            {!hasMore && <ProposeModuleCard href={proposeHref} label={proposeLabel} />}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((c) => Math.min(c + BATCH_SIZE, filtered.length))}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No modules match the &ldquo;{activeTag ?? ''}&rdquo; tag.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Pass the new props from the utilities page**

In `src/app/utilities/page.tsx`, replace the `<TagFilter modules={modules} />` line (line 19):

```tsx
        <TagFilter
          modules={modules}
          proposeHref="https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml"
          proposeLabel="Propose a new utility"
        />
```

- [ ] **Step 3: Pass the new props from the games page**

In `src/app/games/page.tsx`, update the `<TagFilter ...>` element (lines 21–34) to add the two new props alongside the existing `modules` and `emptyState`:

```tsx
        <TagFilter
          modules={modules}
          proposeHref="https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml"
          proposeLabel="Propose a new game"
          emptyState={
            <EmptyState
              icon={<Gamepad2 className="h-12 w-12" />}
              title="No games yet"
              description="Games are on the way. Check the open issues to see what's coming or suggest a new one."
              cta={{
                label: 'View open game issues',
                href: 'https://github.com/hoferan/miniyard/issues?q=label%3Aminigame+is%3Aopen',
              }}
            />
          }
        />
```

- [ ] **Step 4: Run the E2E tests to verify they pass**

Run: `npx playwright test propose-module-card.spec.ts`
Expected: all 3 tests PASS.

- [ ] **Step 5: Run typecheck and unit tests**

Run: `npm run typecheck && npm run test`
Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/tag-filter.tsx src/app/utilities/page.tsx src/app/games/page.tsx
git commit -m "feat: add Load more pagination and propose-module card to category pages"
```

---

### Task 8: Full verification and docs check

**Files:** none (verification only, plus any doc fix found necessary)

- [ ] **Step 1: Run the full unit test suite**

Run: `npm run test`
Expected: all tests PASS, including `src/lib/registry.test.ts`.

- [ ] **Step 2: Run the full E2E suite**

Run: `npm run test:e2e`
Expected: all tests PASS, including `tests/e2e/propose-module-card.spec.ts`, `tests/e2e/homepage.spec.ts`, and `tests/e2e/module-card.spec.ts`.

- [ ] **Step 3: Run typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both PASS with no errors.

- [ ] **Step 4: Manually verify `ShowMoreCard` and "Load more" (not reachable with today's real data)**

Today's registry has 5 utilities and 5 games — under both the 5-item home cap and the 9-item category batch size — so `ShowMoreCard` and the "Load more" button never render with real data. Verify them manually:

1. Run `npm run dev`.
2. In `src/lib/registry.ts`, temporarily duplicate one module meta import entry in the `registry` array (e.g. list `unitConverterMeta` twice) so a category exceeds 5 modules — or temporarily lower `HOME_PREVIEW_LIMIT` to `3` in `src/components/home-search.tsx` and `BATCH_SIZE` to `3` in `src/components/tag-filter.tsx`.
3. Confirm in the browser: the home page shows a "+N more" tile linking to the category page, and the category page shows a "Load more" button that reveals more modules on click and disappears once exhausted (replaced by the propose card).
4. Revert both temporary changes (`git diff` should be empty before committing).

- [ ] **Step 5: Check documentation for staleness**

Run: `grep -rn "5 newest\|Load more\|show more\|propose a new module" README.md CLAUDE.md`

Expected: no existing references (this is new UI behavior). Confirm neither `README.md` nor `CLAUDE.md` documents home-page/category-page listing behavior at a level of detail that this change would make stale — both files describe project structure and workflows, not per-page module-count behavior, so no doc update is required. If a reviewer disagrees, add a short note to `README.md`'s features section instead.

- [ ] **Step 6: Final commit (only if Step 5 required a doc change)**

```bash
git add README.md
git commit -m "docs: note home page and category page module list limits"
```
