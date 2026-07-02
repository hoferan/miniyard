# Module Page Loading UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the ~2-second no-feedback gap when clicking a module card by statically generating module pages and adding layout-matching `loading.tsx` skeleton boundaries.

**Architecture:** Two independent layers. (1) `generateStaticParams` + `dynamicParams = false` on both `[slug]` routes makes module pages fully static, removing the Netlify serverless cold start that causes the delay. (2) Five `loading.tsx` route files backed by two shared skeleton components guarantee instant visual feedback for any latency that remains (slow network, prefetch not yet fired).

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS, shadcn/ui `Skeleton` (already installed at `src/components/ui/skeleton.tsx`).

**Spec:** `docs/superpowers/specs/2026-07-02-module-loading-ux-design.md`

## Global Constraints

- TypeScript strict mode — no `any`.
- Functional components only; server components by default — none of the new files need `'use client'` (no hooks, no browser APIs).
- No new npm packages. No inline styles — Tailwind utility classes only.
- All repo content in English. Conventional Commits (`feat:`, `docs:`, ...).
- Testing note: this change has no `logic.ts` — the project unit-tests pure logic only, and there is no component-test infrastructure. The test cycle for each task is `npm run typecheck` + `npm run build` (with expected output stated per task) instead of a failing-unit-test cycle; the existing Vitest and Playwright suites act as regression gates in Task 4.
- Markdown edits: every fenced code block needs a language identifier (MD040 — enforced by the pre-commit hook).

---

### Task 1: Statically generate module detail pages

**Files:**
- Modify: `src/app/utilities/[slug]/page.tsx`
- Modify: `src/app/games/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getModulesByCategory(category)` from `src/lib/registry.ts` (existing; returns `Module[]` where `Module` has a `slug: string` field).
- Produces: both `[slug]` routes become build-time static (SSG). No exported symbols consumed by later tasks.

- [ ] **Step 1: Add static params to the utilities slug page**

In `src/app/utilities/[slug]/page.tsx`, change the registry import (line 1) and insert the two exports directly below the imports:

```tsx
import { getModuleBySlug, getModulesByCategory } from '@/lib/registry'
```

```tsx
export const dynamicParams = false

export function generateStaticParams() {
  return getModulesByCategory('utilities').map((m) => ({ slug: m.slug }))
}
```

The rest of the file (`generateMetadata`, `UtilityPage`) stays unchanged.

- [ ] **Step 2: Add static params to the games slug page**

Same change in `src/app/games/[slug]/page.tsx` — update the import and insert below the imports:

```tsx
import { getModuleBySlug, getModulesByCategory } from '@/lib/registry'
```

```tsx
export const dynamicParams = false

export function generateStaticParams() {
  return getModulesByCategory('games').map((m) => ({ slug: m.slug }))
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 4: Build and verify SSG output**

Run: `npm run build`
Expected: build succeeds, and the route table marks `/utilities/[slug]` and `/games/[slug]` with `●` (SSG — "prerendered as static HTML (uses generateStaticParams)"), listing all 8 module paths (4 utilities: `unit-converter`, `base64-converter`, `password-strength-checker`, `color-converter`; 4 games: `memory-card`, `typing-speed-test`, `reaction-time-test`, `snake`). If either route still shows `ƒ` (dynamic), stop and investigate before committing.

- [ ] **Step 5: Run unit tests as regression check**

Run: `npm run test`
Expected: all existing tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/utilities/[slug]/page.tsx src/app/games/[slug]/page.tsx
git commit -m "feat: statically generate module detail pages"
```

---

### Task 2: Module page skeleton + [slug] loading boundaries

**Files:**
- Create: `src/components/module-page-skeleton.tsx`
- Create: `src/app/utilities/[slug]/loading.tsx`
- Create: `src/app/games/[slug]/loading.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `src/components/ui/skeleton.tsx` (existing; `div` with `animate-pulse rounded-md bg-muted`, accepts `className`). `ModuleSkeleton` from `src/components/module-skeleton.tsx` (existing; renders three content placeholder bars in a `max-w-lg` container).
- Produces: `ModulePageSkeleton(): JSX.Element` — named export, no props. Server component.

- [ ] **Step 1: Create the module page skeleton component**

`src/components/module-page-skeleton.tsx` — mirrors `ModulePageLayout` (`src/components/module-page-layout.tsx`): same `mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6` container, placeholder bars for breadcrumb, `h1` title and description, then the existing `ModuleSkeleton` for the module content area:

```tsx
import { Skeleton } from '@/components/ui/skeleton'
import { ModuleSkeleton } from '@/components/module-skeleton'

export function ModulePageSkeleton() {
  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-5 h-8 w-2/3" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
      <ModuleSkeleton />
    </>
  )
}
```

- [ ] **Step 2: Create the two [slug] loading boundaries**

`src/app/utilities/[slug]/loading.tsx`:

```tsx
import { ModulePageSkeleton } from '@/components/module-page-skeleton'

export default function Loading() {
  return <ModulePageSkeleton />
}
```

`src/app/games/[slug]/loading.tsx` — identical content:

```tsx
import { ModulePageSkeleton } from '@/components/module-page-skeleton'

export default function Loading() {
  return <ModulePageSkeleton />
}
```

- [ ] **Step 3: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both exit 0; build route table unchanged from Task 1 (loading files add no routes).

- [ ] **Step 4: Commit**

```bash
git add src/components/module-page-skeleton.tsx "src/app/utilities/[slug]/loading.tsx" "src/app/games/[slug]/loading.tsx"
git commit -m "feat: add loading skeleton for module detail pages"
```

---

### Task 3: Category page skeleton + category and root loading boundaries

**Files:**
- Create: `src/components/category-page-skeleton.tsx`
- Create: `src/app/utilities/loading.tsx`
- Create: `src/app/games/loading.tsx`
- Create: `src/app/loading.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `src/components/ui/skeleton.tsx` (existing).
- Produces: `CategoryPageSkeleton(): JSX.Element` — named export, no props. Server component.

- [ ] **Step 1: Create the category page skeleton component**

`src/components/category-page-skeleton.tsx` — mirrors the category pages (`src/app/utilities/page.tsx`): `mx-auto max-w-[1040px] px-4 py-8 sm:px-6` container, heading and description bars, a tag-chip row matching `TagFilter`'s `mb-6 flex flex-wrap gap-2`, and a card grid matching `TagFilter`'s `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` with card-shaped placeholders (`ModuleCard` is a `rounded-[22px] p-6` card, ~11rem tall):

```tsx
import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_CARD_COUNT = 6

export function CategoryPageSkeleton() {
  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <Skeleton className="mb-1.5 h-9 w-44" />
      <Skeleton className="mb-8 h-5 w-64" />
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-[22px]" />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create the category and root loading boundaries**

`src/app/utilities/loading.tsx`:

```tsx
import { CategoryPageSkeleton } from '@/components/category-page-skeleton'

export default function Loading() {
  return <CategoryPageSkeleton />
}
```

`src/app/games/loading.tsx` — identical content:

```tsx
import { CategoryPageSkeleton } from '@/components/category-page-skeleton'

export default function Loading() {
  return <CategoryPageSkeleton />
}
```

`src/app/loading.tsx` (root — covers home and any route without a closer boundary; per spec it reuses the category skeleton since home is also a module grid) — identical content:

```tsx
import { CategoryPageSkeleton } from '@/components/category-page-skeleton'

export default function Loading() {
  return <CategoryPageSkeleton />
}
```

Nearest-boundary-wins: the `[slug]` routes keep their `ModulePageSkeleton` from Task 2; these three only cover the listing pages.

- [ ] **Step 3: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both exit 0; route table unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/category-page-skeleton.tsx src/app/utilities/loading.tsx src/app/games/loading.tsx src/app/loading.tsx
git commit -m "feat: add loading skeletons for category and home pages"
```

---

### Task 4: Documentation + full verification

**Files:**
- Modify: `CLAUDE.md` (project structure tree, new-category checklist, new-category page template)

**Interfaces:**
- Consumes: nothing from earlier tasks (docs describe them).
- Produces: nothing consumed by code.

- [ ] **Step 1: Update the CLAUDE.md project structure tree**

In the `## Project Structure` tree, replace:

```text
  app/
    page.tsx                    # Home – shows all modules
    utilities/
      page.tsx                  # Category listing page
      [slug]/page.tsx           # Individual module page
    games/
      page.tsx
      [slug]/page.tsx
```

with:

```text
  app/
    page.tsx                    # Home – shows all modules
    loading.tsx                 # Root loading boundary (CategoryPageSkeleton)
    utilities/
      page.tsx                  # Category listing page
      loading.tsx               # Category loading boundary
      [slug]/page.tsx           # Individual module page (statically generated)
      [slug]/loading.tsx        # Module loading boundary
    games/
      page.tsx
      loading.tsx
      [slug]/page.tsx
      [slug]/loading.tsx
```

and in the `components/` part of the same tree, after the `module-page-layout.tsx` line, add:

```text
    module-page-skeleton.tsx    # Loading skeleton for module detail pages
    category-page-skeleton.tsx  # Loading skeleton for category/home listing pages
```

- [ ] **Step 2: Update the new-category checklist and template in CLAUDE.md**

In `## How to Add a New Category` → "Files to create", replace:

```text
src/app/[category]/
  page.tsx                     # Category listing page
  [slug]/page.tsx              # Module detail page (uses ModulePageLayout + module-content)
```

with:

```text
src/app/[category]/
  page.tsx                     # Category listing page
  loading.tsx                  # Category loading boundary (CategoryPageSkeleton)
  [slug]/page.tsx              # Module detail page (uses ModulePageLayout + module-content)
  [slug]/loading.tsx           # Module loading boundary (ModulePageSkeleton)
```

In the `[slug]/page.tsx` template in the same section, add the static-generation exports so future categories inherit the fix. After the line `import type { Metadata } from 'next'` and before `export async function generateMetadata`, insert:

```tsx
export const dynamicParams = false

export function generateStaticParams() {
  return getModulesByCategory('[category]').map((m) => ({ slug: m.slug }))
}
```

and change that template's registry import from `import { getModuleBySlug } from '@/lib/registry'` to `import { getModuleBySlug, getModulesByCategory } from '@/lib/registry'`.

- [ ] **Step 3: Markdown lint**

Run: `npm run lint:md`
Expected: 0 errors.

- [ ] **Step 4: Full verification suite**

Run: `npm run typecheck && npm run lint && npm run build && npm run test`
Expected: all exit 0; build route table shows `●` for both `[slug]` routes.

Run: `npm run test:e2e`
Expected: all Playwright tests pass (they navigate category → module pages, exercising the new static routes and boundaries).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document loading boundaries and static module pages"
```
