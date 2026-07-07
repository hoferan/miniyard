# Spec: Module List Scalability (Home Cap + Category Pagination)

**Date:** 2026-07-07
**Category:** Cross-cutting (home page + category pages, shared components)
**Workflow:** C (UI adjustment — no module logic changes)

## Problem

The home page renders every module in every category, and category pages
(`/utilities`, `/games`) render every module in a single grid. With only 5
modules per category today this is fine, but the registry is growing steadily
(10 modules already, new ones added most weeks). Without a cap, the home page
will keep growing taller with every new module and stop working as a quick
overview; category pages will keep growing into long, unpaginated grids.

## Goals

- Home page shows at most 5 modules per category, newest first, with a
  trailing tile linking to the full category page when there are more.
- Category pages load modules in batches via a "Load more" button instead of
  rendering the entire set at once.
- No change to the search-results view on the home page (only the default,
  no-query view is capped).
- No change to category page ordering (registry order stays as-is; only the
  home page preview is sorted by newest).

## Design

### 1. Data layer — `src/lib/registry.ts`

Add one pure helper:

```ts
export function sortModulesByNewest(modules: Module[]): Module[] {
  return [...modules].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
```

`Array.prototype.sort` is stable, so modules with identical `createdAt` keep
their relative registry order as a tiebreaker — no extra tiebreak logic
needed. This helper is only consumed by the home page; `getModulesByCategory`
and category pages are unchanged.

### 2. Home page — `src/components/home-search.tsx`

Only the empty-query branch (`q === ''`) changes; the search-results branch is
untouched.

- For each category: `const sorted = sortModulesByNewest(categoryModules)`,
  then `const visible = sorted.slice(0, 5)`.
- If `categoryModules.length > 5`, render one extra grid tile after the visible
  cards: a new `ShowMoreCard` component linking to the category's `href`.
- Grid classes stay `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — 5 cards + 1
  show-more tile = 6 tiles, a clean 2-row layout on desktop.

New component — `src/components/show-more-card.tsx`:

- Same tile shell as `ModuleCard` (rounded-[22px], border, backdrop-blur,
  shadow, hover lift) so it sits visually consistent in the grid.
- Content: a right-arrow icon (lucide `ArrowRight`) and `"+{remaining} more"`
  text, where `remaining = categoryModules.length - 5`.
- Wrapped in `next/link` pointing at the category `href` (`/utilities` or
  `/games`).
- Props: `{ href: string; remaining: number }`.

### 3. Category pages — `src/components/tag-filter.tsx`

- `const BATCH_SIZE = 9`
- `const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)`
- `useEffect(() => setVisibleCount(BATCH_SIZE), [activeTag])` — changing the
  tag filter (or clearing it) always resets pagination back to the first
  batch of the newly filtered set.
- Grid renders `filtered.slice(0, visibleCount)` instead of all of `filtered`.
- When `filtered.length > visibleCount`, render a centered "Load more" button
  below the grid. On click:
  `setVisibleCount((c) => Math.min(c + BATCH_SIZE, filtered.length))`.
- No URL/query-param state for pagination — a reload or revisit always starts
  back at the first 9 (per confirmed decision).

## Edge cases

- Category with ≤ 5 modules on the home page: no `ShowMoreCard` rendered
  (today's real data — 5 utilities, 5 games — is visually unaffected).
- Category with ≤ 9 modules on its category page: no "Load more" button
  (today's real data is visually unaffected).
- Tied `createdAt` values: stable sort keeps registry order as tiebreaker.
- Switching to a tag whose filtered set is smaller than the current
  `visibleCount`: the `useEffect` resets to `BATCH_SIZE` before the slice
  runs, and `slice` clamps regardless.
- Empty filtered set: unchanged — existing "No modules match" message still
  applies, and no "Load more" button renders since `0` is never greater than
  `visibleCount`.

## Out of scope

- Persisting loaded/pagination state in the URL.
- Infinite scroll / IntersectionObserver.
- Numbered pagination.
- Reordering category pages by newest (registry order stays).
- Changing the home page's search-results (non-empty query) view.

## Testing

Real registry data (5 utilities, 5 games) is under both new thresholds (5 cap,
9 batch), so neither new UI path is reachable end-to-end with real data today.
Per the confirmed testing approach:

- **Unit test** `src/lib/registry.test.ts`: `sortModulesByNewest` sorts
  synthetic `Module[]` fixtures newest-first and preserves order for tied
  `createdAt` values.
- **E2E tests**: leave existing `tests/e2e/homepage.spec.ts` and category-page
  coverage as-is (they still exercise real data correctly); do not add E2E
  assertions that depend on crossing the 5- or 9-item thresholds, since real
  data doesn't cross them. Visual correctness of `ShowMoreCard` and "Load
  more" is confirmed via manual/dev-server check during implementation
  instead.
- `npm run typecheck`, `npm run build`, `npm run test` must all stay green.

## New files

```text
src/components/show-more-card.tsx
src/lib/registry.test.ts
```

## Changed files

```text
src/lib/registry.ts          # + sortModulesByNewest
src/components/home-search.tsx  # cap + sort + ShowMoreCard in empty-query branch
src/components/tag-filter.tsx   # + BATCH_SIZE pagination state and Load more button
```

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run test` (existing tests + new `registry.test.ts`)
- `npm run test:e2e` (existing suite stays green)
- Manual check on dev server: temporarily raise registry count locally (or use
  browser devtools) to confirm `ShowMoreCard` and "Load more" render and
  behave correctly, then revert.
