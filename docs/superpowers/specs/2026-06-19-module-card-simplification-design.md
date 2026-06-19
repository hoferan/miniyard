# Spec: Module Card Simplification + "NEW" Badge

**Date:** 2026-06-19
**Category:** UI / UX
**Status:** Approved

## Summary

Simplify the module card by removing decorative fields (icon, order number) and the static hardcoded status badge. Replace with a single `createdAt` date field on each module and a dynamic "NEW" badge that appears automatically for modules added within the last 14 days.

## Motivation

- The icon adds visual noise without communicating useful information
- The hardcoded `status: 'stable'` badge is meaningless — every module carries it regardless of actual state
- The order number is redundant with grid position
- A "NEW" badge serves a real purpose: returning visitors can spot recently added modules at a glance

## Data Layer

### `src/lib/types.ts`

Remove fields:
- `icon: string`
- `status: ModuleStatus`
- `isPro?: boolean`
- `requiresAuth?: boolean`

Remove type:
- `ModuleStatus`

Add field:
- `createdAt: string` — ISO date string, e.g. `"2025-06-10"`

Resulting `Module` type:

```ts
export type ModuleCategory = 'utilities' | 'games'

export type Module = {
  slug: string
  title: string
  description: string
  category: ModuleCategory
  tags: string[]
  createdAt: string
}
```

### All `meta.ts` files (4 modules)

- Remove `icon` and `status` fields
- Add `createdAt` with the module's actual creation date sourced from git history

Modules to update:
- `src/modules/utilities/unit-converter/meta.ts`
- `src/modules/utilities/base64-converter/meta.ts`
- `src/modules/games/memory-card/meta.ts`
- `src/modules/games/typing-speed-test/meta.ts`

## New Component

Add `src/components/ui/badge.tsx` from shadcn/ui.

Install method: manual fetch from the shadcn GitHub repo (cloud-safe):
`https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/new-york/ui/badge.tsx`

## Logic

Add `isNew(createdAt: string): boolean` to `src/lib/utils.ts`:

- Returns `true` if the module was created within the last 14 days
- Pure function, no side effects, easy to unit test
- Threshold: 14 days (2 weeks)

## Card UI

### Remove

- Icon box (52×52, top-left)
- Order number (top-right, `01`/`02`/…)
- Status dot + label (bottom, always emerald "stable")

### Add

- "NEW" badge in the top-right corner, rendered only when `isNew(module.createdAt)` returns `true`
- When not new: top-right area is empty

### Resulting card layout (top to bottom)

```text
[ UTILITY ]                              [ NEW ]   ← only when fresh
Module Title
Short description of what the module does.
```

No badge, no icon, no number — just content.

## Files Changed

| File | Change |
|---|---|
| `src/lib/types.ts` | Remove `icon`, `status`, `isPro`, `requiresAuth`; add `createdAt` |
| `src/lib/utils.ts` | Add `isNew(createdAt)` |
| `src/components/ui/badge.tsx` | New — shadcn Badge component |
| `src/components/module-card.tsx` | Remove icon/order/status; add conditional "NEW" badge |
| `src/modules/utilities/unit-converter/meta.ts` | Remove `icon`/`status`; add `createdAt` |
| `src/modules/utilities/base64-converter/meta.ts` | Remove `icon`/`status`; add `createdAt` |
| `src/modules/games/memory-card/meta.ts` | Remove `icon`/`status`; add `createdAt` |
| `src/modules/games/typing-speed-test/meta.ts` | Remove `icon`/`status`; add `createdAt` |

## Edge Cases

- All 4 existing modules have `createdAt` dates older than 14 days → no "NEW" badge shown initially (expected)
- A new module added today will show "NEW" for exactly 14 days, then the badge disappears automatically
- `isNew` compares calendar dates at render time — no caching needed, no server-side logic

## Testing

- Unit test for `isNew()` in `src/lib/utils.test.ts` (if it doesn't exist, create it)
  - Returns `true` for a date 13 days ago
  - Returns `false` for a date 15 days ago
  - Returns `false` for a date exactly 14 days ago (boundary)
- TypeScript check must pass after removing fields from all meta files
- Build must pass
