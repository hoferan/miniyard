# Reduce Motion Feature Flag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Labs toggle that disables all decorative CSS animations in miniyard, mirroring the OS `prefers-reduced-motion: reduce` setting but scoped to this app only.

**Architecture:** A new entry in the feature flag registry triggers a `useEffect` in `FeaturesProvider` that sets/removes a `data-reduce-motion` attribute on `<html>`. The CSS `@media (prefers-reduced-motion: reduce)` block is extended with a `:root[data-reduce-motion]` selector so either condition — OS setting or the flag — stops all decorative animations.

**Tech Stack:** Next.js 14 (App Router), React 19, TypeScript strict, Tailwind CSS, localStorage-based feature flags.

## Global Constraints

- TypeScript strict mode — no `any`; `npm run typecheck` must pass after every task
- All unit tests must remain green — `npm run test` must pass
- No new npm packages
- No new files — three existing files are modified
- Conventional Commits: `feat:` prefix
- English only in all code, comments, and commit messages
- Fenced code blocks in `.md` files must have a language identifier

---

## File Map

| File | Role | Change |
|---|---|---|
| `src/lib/features.ts` | Feature registry | Add `reduce-motion` entry |
| `src/components/features-provider.tsx` | React context + DOM side effect | Add `useEffect` toggling `data-reduce-motion` on `document.documentElement` |
| `src/app/globals.css` | Animation CSS variables | Extend media query block with `:root[data-reduce-motion]` selector |

---

## Task 1: Register the feature, wire the DOM side effect, and update the CSS

All three changes are bundled here because none of them is independently testable: the registry entry does nothing without the CSS, and the CSS does nothing without the DOM attribute being set by the provider.

**Files:**

- Modify: `src/lib/features.ts`
- Modify: `src/components/features-provider.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**

- Produces: `useFeatureFlag('reduce-motion')` returns `true` when the toggle is on
- Produces: `document.documentElement.hasAttribute('data-reduce-motion')` is `true` when the flag is on
- Produces: All `--animate-*` CSS variables resolve to `none` when `[data-reduce-motion]` is present on `<html>`

---

- [ ] **Step 1: Add the feature entry to the registry**

Open `src/lib/features.ts`. The current file looks like this:

```ts
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

Add the new entry at the end of the array:

```ts
export const FEATURES: Feature[] = [
  {
    id: 'tag-filter',
    title: 'Tag-based module filtering',
    description:
      'Adds tag chips to category pages. Click a tag to filter the module grid in real time. Active tag syncs with the URL so filtered views are bookmarkable.',
    defaultEnabled: false,
  },
  {
    id: 'reduce-motion',
    title: 'Reduce motion',
    description:
      'Disables all decorative animations (blobs, logo bob, blinking cursor). Same effect as the OS-level "reduce motion" preference, applied to miniyard only.',
    defaultEnabled: false,
  },
]
```

- [ ] **Step 2: Add the DOM side effect in FeaturesProvider**

Open `src/components/features-provider.tsx`. The existing `useEffect` reads from localStorage. Add a second `useEffect` directly below it that watches `flags` and toggles the `data-reduce-motion` attribute on `document.documentElement`:

```ts
// existing effect — do not touch
useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setFlags((prev) => ({ ...prev, ...(JSON.parse(raw) as FlagsState) }))
  } catch {
    // ignore malformed storage
  }
}, [])

// NEW — keep animations in sync with the flag
useEffect(() => {
  const el = document.documentElement
  if (flags['reduce-motion']) {
    el.setAttribute('data-reduce-motion', '')
  } else {
    el.removeAttribute('data-reduce-motion')
  }
}, [flags])
```

`flags` is the full state object; the effect re-runs whenever any flag changes. Accessing `document.documentElement` inside `useEffect` is safe — it only runs in the browser, never during SSR.

- [ ] **Step 3: Extend the CSS to match the attribute**

Open `src/app/globals.css`. Find the existing `prefers-reduced-motion` block, which currently looks like this:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --animate-blob: none;
    --animate-blob-2: none;
    --animate-blink: none;
    --animate-bob: none;
    --animate-pop-in: none;
  }
}
```

Replace it with:

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

The `:root[data-reduce-motion]` selector targets the `<html>` element when the attribute is present. Both conditions (`@media` and the attribute selector) are independent — either one stops all animations.

- [ ] **Step 4: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors. If errors appear, fix them before continuing.

- [ ] **Step 5: Run unit tests**

```bash
npm run test
```

Expected output:

```text
Test Files  5 passed (5)
     Tests  151 passed (151)
```

No new tests are needed — this feature has no logic in a `logic.ts` file and the behaviour is CSS-driven.

- [ ] **Step 6: Manual verification**

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

1. Confirm the home page shows the blob background animations, the bobbing logo emoji, and the blinking cursor in the hero heading.
2. Navigate to `http://localhost:3000/features`.
3. Find the **Reduce motion** toggle and enable it.
4. Navigate back to `http://localhost:3000`.
5. Confirm all three animations have stopped (blobs frozen, logo still, cursor not blinking).
6. Open DevTools → Elements → inspect the `<html>` tag. Confirm it has `data-reduce-motion=""`.
7. Return to `/features` and disable the toggle.
8. Navigate back to `/`. Confirm animations have resumed.
9. Reload the page with the toggle off. Confirm animations play (flag not persisted from a previous test run).
10. Enable the toggle again, reload the page — confirm animations are still stopped (localStorage persists the flag across reloads).

- [ ] **Step 7: Commit**

```bash
git add src/lib/features.ts src/components/features-provider.tsx src/app/globals.css
git commit -m "feat: add reduce-motion Labs feature flag

Adds a /features toggle that disables all decorative CSS animations
(blobs, bob, blink) by setting data-reduce-motion on <html>. The CSS
@media block is extended to match this attribute so either the OS
setting or the in-app toggle is sufficient to stop animations."
```
