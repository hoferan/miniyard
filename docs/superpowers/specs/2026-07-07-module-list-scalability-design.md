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
- Once a module list reaches its end (home page preview, or a fully-loaded
  category page), show a trailing card inviting the user to propose a new
  module as a GitHub issue, linking to the category-specific issue template.
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
- After that, always render one more trailing tile: `ProposeModuleCard` (see
  section 4), linking to that category's GitHub issue template.
- Tile order per category section: `[visible modules] + [ShowMoreCard if any] +
  [ProposeModuleCard]`.
- Grid classes stay `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. With today's
  real data (5 modules per category, no show-more needed) this is 5 + 1
  propose tile = 6 tiles, a clean 2-row layout on desktop.

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
- When `filtered.length > 0 && visibleCount >= filtered.length` (i.e. no
  "Load more" button left to show, including after tag filtering), append
  `ProposeModuleCard` as the final grid tile. `TagFilter` is shared by both
  category pages, so it takes a new `proposeHref: string` prop — each page
  (`src/app/utilities/page.tsx`, `src/app/games/page.tsx`) passes its own
  category's issue-template URL.
- The existing "No modules match" empty-tag-filter message is unchanged;
  `ProposeModuleCard` is not appended in that state (out of scope — that
  message already exists and isn't part of this change).

### 4. Propose-a-module card — `src/components/propose-module-card.tsx`

New shared component, used by both the home page and category pages:

- Same tile shell as `ModuleCard`/`ShowMoreCard` for visual consistency.
- Uses the `ExternalLink` lucide icon and `target="_blank" rel="noopener
  noreferrer"`, matching the existing external-link convention in
  `src/components/empty-state.tsx`.
- Props: `{ href: string; label: string }` — `label` is category-specific
  copy (e.g. "Propose a new utility" / "Propose a new game"), `href` points
  at the category's GitHub issue template:
  - Utilities: `https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml`
  - Games: `https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml`
- These URLs are passed in by the caller (home page section, category page),
  matching the existing pattern of hardcoding GitHub URLs directly at the
  call site (see `src/app/games/page.tsx`'s existing `EmptyState` CTA) rather
  than introducing a new shared constants module.

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
  `visibleCount`. `ProposeModuleCard` is not appended in this state either
  (see section 3).
- `ProposeModuleCard`'s `target="_blank"` link is independent of pagination —
  it always appears once a list has nothing more to show, regardless of
  whether that's because the category is small or a batch/tag filter has been
  fully paged through.

## Out of scope

- Persisting loaded/pagination state in the URL.
- Infinite scroll / IntersectionObserver.
- Numbered pagination.
- Reordering category pages by newest (registry order stays).
- Changing the home page's search-results (non-empty query) view.
- Adding `ProposeModuleCard` to the zero-modules `EmptyState` CTA (that
  already has its own "view open issues" CTA linking to an issue search, a
  different purpose from proposing a new issue).

## Testing

Real registry data (5 utilities, 5 games) is under the home-page cap (5) and
category-page batch size (9), so `ShowMoreCard` and the "Load more" button are
not reachable end-to-end with real data today — but `ProposeModuleCard` *is*
reachable, since every category is already "fully loaded" / at the end of its
home preview with today's counts. Per the confirmed testing approach:

- **Unit test** `src/lib/registry.test.ts`: `sortModulesByNewest` sorts
  synthetic `Module[]` fixtures newest-first and preserves order for tied
  `createdAt` values.
- **E2E tests**: leave existing `tests/e2e/homepage.spec.ts` and category-page
  coverage as-is for existing assertions; do not add E2E assertions that
  depend on crossing the 5- or 9-item thresholds, since real data doesn't
  cross them. Visual correctness of `ShowMoreCard` and "Load more" is
  confirmed via manual/dev-server check during implementation instead. Do add
  a dedicated E2E spec, `tests/e2e/propose-module-card.spec.ts`, asserting
  `ProposeModuleCard` is visible (with correct `href` and `target="_blank"`)
  at the end of the home page's utilities/games sections and at the end of
  each category page, since this is reachable with real data today.
- `npm run typecheck`, `npm run build`, `npm run test` must all stay green.

## New files

```text
src/components/show-more-card.tsx
src/components/propose-module-card.tsx
src/lib/registry.test.ts
tests/e2e/propose-module-card.spec.ts
```

## Changed files

```text
src/lib/registry.ts          # + sortModulesByNewest
src/components/home-search.tsx  # cap + sort + ShowMoreCard + ProposeModuleCard in empty-query branch
src/components/tag-filter.tsx   # + BATCH_SIZE pagination state, Load more button, + proposeHref prop / ProposeModuleCard
src/app/utilities/page.tsx      # pass proposeHref (new_utility_tool.yml) to TagFilter
src/app/games/page.tsx          # pass proposeHref (new_minigame.yml) to TagFilter
```

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run test` (existing tests + new `registry.test.ts`)
- `npm run test:e2e` (existing suite + new `ProposeModuleCard` assertions)
- Manual check on dev server: temporarily raise registry count locally (or use
  browser devtools) to confirm `ShowMoreCard` and "Load more" render and
  behave correctly, then revert.
