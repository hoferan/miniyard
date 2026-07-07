# Spec: Module Page Loading UX

**Date:** 2026-07-02
**Category:** Cross-cutting (app routes + shared components)
**Workflow:** C (UI/perf adjustment — no module logic changes)

## Problem

Clicking a module card can take up to ~2 seconds with zero visual feedback before
the module page appears.

Root cause (two parts):

1. `/utilities/[slug]` and `/games/[slug]` have no `generateStaticParams`, so they
   are server-rendered on demand. On Netlify each navigation invokes a serverless
   function; a cold start accounts for the ~2 seconds.
2. There is no `loading.tsx` anywhere in `src/app`, so the App Router has no
   loading boundary to show during the round trip. The existing `ModuleSkeleton`
   only covers the client chunk load *after* the page shell arrives.

## Goals

- Remove the serverless round trip for module pages (fix the cause).
- Guarantee immediate visual feedback on every navigation, including category
  pages and home (cover the remainder).
- No new dependencies, no inline styles, reuse the existing shadcn `Skeleton`.

## Design

### 1. Static generation of module pages

In `src/app/utilities/[slug]/page.tsx` and `src/app/games/[slug]/page.tsx`:

- Add `generateStaticParams` returning `getModulesByCategory('<category>')`
  mapped to `{ slug }` objects.
- Add `export const dynamicParams = false` so unknown slugs 404 at the router
  level and the routes stay fully static. The registry lives in code, so new
  modules require a rebuild regardless.

Result: module pages are prerendered at build time; client navigation serves the
prefetched static RSC payload with no function invocation.

### 2. Loading boundaries with layout-matching skeletons

Two new shared components in `src/components/`, both built from the existing
shadcn `Skeleton` (pulse animation):

- **`ModulePageSkeleton`** (`src/components/module-page-skeleton.tsx`) — mirrors
  `ModulePageLayout`: breadcrumb line, title bar, description line, then the
  existing `ModuleSkeleton` content blocks.
- **`CategoryPageSkeleton`** (`src/components/category-page-skeleton.tsx`) —
  heading bar, description line, and a responsive grid
  (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`) of card-shaped skeletons
  matching `ModuleCard` dimensions.

New route files, each a one-line default export of the matching skeleton:

```text
src/app/loading.tsx                     # root — covers home and unboundaried routes (CategoryPageSkeleton)
src/app/utilities/loading.tsx           # category listing (CategoryPageSkeleton)
src/app/utilities/[slug]/loading.tsx    # module detail (ModulePageSkeleton)
src/app/games/loading.tsx               # category listing (CategoryPageSkeleton)
src/app/games/[slug]/loading.tsx        # module detail (ModulePageSkeleton)
```

Nearest boundary wins, so `[slug]` routes use the module skeleton while their
parent segment uses the category skeleton.

## Edge cases

- **Unknown slug:** handled by `dynamicParams = false` (router-level 404);
  `not-found.tsx` behavior unchanged.
- **Slow network / prefetch not yet fired:** `loading.tsx` skeleton shows
  immediately, which is the fallback the static generation alone would not cover.
- **New module added:** appears in `generateStaticParams` automatically via the
  registry; no extra registration step.

## Out of scope

- Changing `ModuleSkeleton` internals or the dynamic-import chunk loading.
- Progress bars, spinners, or any new animation primitives.
- E2E tests for the loading states themselves (they flash too fast locally to
  assert reliably).

## New files

```text
src/components/module-page-skeleton.tsx
src/components/category-page-skeleton.tsx
src/app/loading.tsx
src/app/utilities/loading.tsx
src/app/utilities/[slug]/loading.tsx
src/app/games/loading.tsx
src/app/games/[slug]/loading.tsx
```

## Changed files

```text
src/app/utilities/[slug]/page.tsx   # generateStaticParams + dynamicParams
src/app/games/[slug]/page.tsx       # generateStaticParams + dynamicParams
CLAUDE.md                           # project structure tree + new-category checklist include loading.tsx
```

## Verification

- `npm run typecheck`
- `npm run build` — module routes must appear as prerendered (SSG) in build output
- `npm run test` — existing unit tests green
- `npm run test:e2e` — existing E2E tests green (they navigate to module pages,
  so they exercise the new static routes)
