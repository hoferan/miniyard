# Spec: Reduce Motion Feature Flag

**Date:** 2026-06-20
**Category:** Experimental feature (Labs)
**Status:** Approved

## Function

Add a Labs toggle that disables all decorative CSS animations in miniyard, replicating the effect of the OS-level `prefers-reduced-motion: reduce` setting but scoped to this app only.

## Problem

The OS `prefers-reduced-motion` setting is buried in system preferences. Users who dislike motion on the web may not know it exists or may not want to apply it system-wide. A per-app toggle gives them in-app control without touching OS settings.

## Behaviour

- When the flag is **off** (default): animations play normally; only the OS media query gates them.
- When the flag is **on**: all `--animate-*` CSS variables are set to `none`, stopping blink, bob, blob-float, blob-float-2, and pop-in animations.
- Either condition (OS setting **or** the flag) is sufficient to disable animations; they combine with `OR` logic.
- The setting persists in `localStorage` via the existing feature flag mechanism.
- The feature appears automatically on `/features` — no page edit needed.

## Architecture

Three small changes, no new files:

### 1. `src/lib/features.ts`

Add an entry to the `FEATURES` array:

```ts
{
  id: 'reduce-motion',
  title: 'Reduce motion',
  description: 'Disables all decorative animations (blobs, logo bob, blinking cursor). Same effect as the OS-level "reduce motion" preference, applied to miniyard only.',
  defaultEnabled: false,
}
```

### 2. `src/components/features-provider.tsx`

Add a `useEffect` that watches `flags['reduce-motion']` and toggles a `data-reduce-motion` attribute on `document.documentElement`:

```ts
useEffect(() => {
  const el = document.documentElement
  if (flags['reduce-motion']) {
    el.setAttribute('data-reduce-motion', '')
  } else {
    el.removeAttribute('data-reduce-motion')
  }
}, [flags])
```

This mirrors the pattern used by `next-themes` (which applies `class="dark"` to `<html>`). The attribute is set/removed on every flag change, keeping the DOM in sync with localStorage.

### 3. `src/app/globals.css`

Extend the existing `@media (prefers-reduced-motion: reduce)` block to also match the HTML attribute:

```css
@media (prefers-reduced-motion: reduce),
       :root[data-reduce-motion] {
  :root {
    --animate-blob: none;
    --animate-blob-2: none;
    --animate-blink: none;
    --animate-bob: none;
    --animate-pop-in: none;
  }
}
```

The selector `:root[data-reduce-motion]` targets the `<html>` element (`:root` in CSS) when the attribute is present. No JavaScript sets CSS variables directly — the side effect is a pure DOM attribute write; CSS handles the rest.

## Edge Cases

- **SSR / hydration:** `document.documentElement` is only accessed inside `useEffect`, so there is no SSR mismatch. On first render, the attribute is absent; it is set after hydration if the flag is on. This causes a brief single-frame flash of animation on page load for users with the flag enabled — acceptable given this is a Labs feature.
- **OS setting + flag both on:** Both selectors match; the rule fires once; no conflict.
- **OS setting on, flag off:** The `@media` branch fires; flag branch does not — correct.
- **New animations added later:** Any future `--animate-*` variable added to both `:root` and this block is automatically gated.

## Out of Scope

- Radix UI enter/exit animations (Dialog open/close, Select dropdown): these use Tailwind `animate-in`/`animate-out` classes driven by `@keyframes` not covered by the `--animate-*` variables. Gating those requires the Tailwind `motion-reduce:` variant and is a separate concern.
- Transitions (`transition-colors`, `transition-all`): intentionally excluded — these are functional (hover feedback, focus rings) rather than decorative.

## Files Changed

| File | Change |
|---|---|
| `src/lib/features.ts` | Add `reduce-motion` entry to `FEATURES` array |
| `src/components/features-provider.tsx` | Add `useEffect` to toggle `data-reduce-motion` on `document.documentElement` |
| `src/app/globals.css` | Extend media query block with `:root[data-reduce-motion]` selector |

## Testing

- Toggle the flag on `/features` and verify blink/bob/blob animations stop.
- Toggle off and verify they resume.
- Enable OS `prefers-reduced-motion` independently and verify animations also stop (OS path still works).
- Verify the flag persists across page reloads.
- No unit tests required — no logic in `logic.ts`; behaviour is CSS-driven.
