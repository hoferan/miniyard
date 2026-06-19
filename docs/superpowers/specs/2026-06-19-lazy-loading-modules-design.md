# Spec: Lazy Loading of Module Components

**Date:** 2026-06-19
**Category:** Performance
**Status:** Approved

## Summary

Replace static module imports in both `[slug]/page.tsx` files with `next/dynamic()` so each module component is bundled into its own JS chunk and only downloaded when the user navigates to that module. Add a loading skeleton for the content area shown while the chunk fetches.

## Motivation

Both `src/app/utilities/[slug]/page.tsx` and `src/app/games/[slug]/page.tsx` currently import all module components statically at the top of the file. This bundles every module in a category into one chunk — a user visiting `/utilities/unit-converter` also downloads `Base64Converter`. As the number of modules grows, this becomes an increasingly wasteful initial load.

## Current State

```ts
// src/app/utilities/[slug]/page.tsx
import UnitConverter from '@/modules/utilities/unit-converter'
import Base64Converter from '@/modules/utilities/base64-converter'

const componentMap: Record<string, React.ComponentType> = {
  'unit-converter': UnitConverter,
  'base64-converter': Base64Converter,
}
```

## Target State

```ts
// src/app/utilities/[slug]/page.tsx
import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap: Record<string, React.ComponentType> = {
  'unit-converter': dynamic(() => import('@/modules/utilities/unit-converter'), { loading: ModuleSkeleton }),
  'base64-converter': dynamic(() => import('@/modules/utilities/base64-converter'), { loading: ModuleSkeleton }),
}
```

## User Flow

```text
User visits /utilities
  → only registry metadata loaded (no module components)
  → cards render immediately

User clicks a module card
  → navigates to /utilities/[slug]
  → page header renders immediately (breadcrumb, title, description — metadata only)
  → dynamic() fetches the module's JS chunk
  → ModuleSkeleton shown in content area while chunk loads
  → module component mounts and replaces skeleton
```

## New Components

### `src/components/ui/skeleton.tsx`

shadcn Skeleton component. Install via manual fetch from:
`https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/new-york/ui/skeleton.tsx`

### `src/components/module-skeleton.tsx`

Shared loading placeholder used as the `loading` prop for all `dynamic()` calls. Renders three stacked skeleton bars in the module content area, sized to suggest a form or interactive panel.

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ModuleSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-4 sm:px-6 space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  )
}
```

## What Does Not Change

- Listing pages (`/utilities`, `/games`) — already fast, use only metadata
- `src/lib/registry.ts` — untouched
- Module components themselves — untouched
- Any module's `meta.ts`, `logic.ts`, or `index.tsx` — untouched

## Files Changed

| File | Change |
|---|---|
| `src/components/ui/skeleton.tsx` | New — shadcn Skeleton component |
| `src/components/module-skeleton.tsx` | New — shared loading placeholder |
| `src/app/utilities/[slug]/page.tsx` | Replace static imports with `next/dynamic()` |
| `src/app/games/[slug]/page.tsx` | Replace static imports with `next/dynamic()` |

## Edge Cases

- On fast connections the skeleton may flash briefly — this is acceptable; no minimum display time needed
- If a dynamic import fails (network error), Next.js will surface its default error boundary — no custom handling needed
- The `loading` component receives no props, so `ModuleSkeleton` must be a zero-argument component (or accept and ignore props)

## Testing

- TypeScript check must pass after replacing imports
- Build must pass and produce separate chunks per module (verifiable in `.next/static/chunks/`)
- Manual smoke test: navigate to each module, confirm skeleton appears briefly then component renders
