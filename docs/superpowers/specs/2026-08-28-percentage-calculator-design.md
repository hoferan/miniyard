# Design: Percentage Calculator

**Issue:** [#76](https://github.com/hoferan/miniyard/issues/76)
**Category:** utilities
**Slug:** `percentage-calculator`
**Date:** 2026-08-28

## Purpose

Answer the three most common percentage questions in one place, so the user does
not have to recall the formulas or reach for a search engine. Each question is a
self-contained mini-calculator that computes as the user types.

## Scope

Three independent calculators, stacked vertically on one page:

| # | Card | Inputs | Formula |
|---|---|---|---|
| 1 | What is X% of Y? | percentage `X`, number `Y` | `(X / 100) * Y` |
| 2 | X is what % of Y? | number `X`, base `Y` | `(X / Y) * 100` |
| 3 | Percentage change from X to Y | old value `X`, new value `Y` | `((Y - X) / abs(X)) * 100` |

Out of scope: copy-to-clipboard buttons, history, sharing, tip/VAT presets.

## Architecture

### `logic.ts` — pure functions, no React, no DOM, no strings

```ts
percentOf(percentage: number, value: number): number | null
whatPercent(value: number, base: number): number | null
percentChange(oldValue: number, newValue: number): number | null
formatResult(value: number | null): string
describeChange(change: number | null): ChangeDescription
```

- The three calculation functions return `null` as the single "cannot compute"
  signal: a non-finite input, or a division whose divisor is zero. Nothing
  throws — an invalid input is a value, not an exception, so no Sentry surface
  is created.
- `formatResult` rounds to at most 2 decimal places and strips trailing zeros
  (`25.00` renders `25`, `33.3333` renders `33.33`). It maps `null` to the `—`
  placeholder from `messages.ts`.
- `describeChange` maps a change percentage to
  `{ text: string; direction: 'increase' | 'decrease' | 'none' }`, so the UI can
  colour the result without re-deriving the sign. Direction is `none` at exactly
  `0`, and the text reads `0% — no change`. Increases read `+25% increase`,
  decreases read `−10% decrease` with a typographic minus (U+2212).

### `messages.ts` — every user-facing string

Card titles, input labels, aria labels, the `—` placeholder, and the three
direction words. `logic.ts` imports the placeholder and direction words from
here and stays string-free otherwise.

### `index.tsx` — `'use client'`

- One `<Card>` per mode, stacked with `space-y-6`, full width on mobile and
  desktop.
- Inputs are held in component state as **strings**, so a half-typed `-` or `.`
  does not flicker or reset. Each render parses the strings once and feeds the
  numbers to `logic.ts`.
- `type="number"` with `inputMode="decimal"` so mobile keyboards open on the
  numeric keypad. Results render in a read-only muted field.
- No inline styles; Tailwind utility classes and `cn()` only.

## Edge cases

Each of these gets a unit test:

| Case | Behaviour |
|---|---|
| Empty input in any field | Result shows `—` |
| Mode 2 with base `Y = 0` | `—` (division by zero) |
| Mode 3 with old value `X = 0` | `—` (division by zero) |
| Mode 3 old `-50` to new `-25` | `+50% increase` (denominator is `abs(X)`) |
| Mode 3 with no change | `0% — no change` |
| Negative percentage or value in modes 1 and 2 | Computed normally, sign preserved |
| Result needs rounding (`1/3`) | `33.33` |
| Result is a whole number (`25.00`) | `25`, trailing zeros stripped |
| Rounding boundary (`0.005`) | Rounded to 2 decimals, no float artefacts |
| `NaN` or `Infinity` reaching a function | `null`, rendered as `—` |

## Testing

- **Unit (`logic.test.ts`, Vitest):** every exported function, every edge case in
  the table above. Written red before `logic.ts` exists.
- **E2E (`tests/e2e/percentage-calculator.spec.ts`, Playwright):** loads the
  page, asserts all three results start as `—`, types into each card and asserts
  the live result, checks the direction wording for an increase and a decrease,
  and takes a screenshot artefact.

## Files

New:

```text
src/modules/utilities/percentage-calculator/meta.ts
src/modules/utilities/percentage-calculator/logic.ts
src/modules/utilities/percentage-calculator/logic.test.ts
src/modules/utilities/percentage-calculator/messages.ts
src/modules/utilities/percentage-calculator/index.tsx
tests/e2e/percentage-calculator.spec.ts
```

Updated:

```text
src/lib/registry.ts                          # register percentageCalculatorMeta
src/components/utilities-module-content.tsx  # componentMap entry
src/lib/icons.ts                             # 'percent' -> Percent (lucide-react)
README.md                                    # utilities module list
```

No `docs/utilities/percentage-calculator.md` — the logic is three one-line
formulas and needs no extended documentation. No new npm packages.
