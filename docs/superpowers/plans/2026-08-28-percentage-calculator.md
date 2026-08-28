# Percentage Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `percentage-calculator` module to the utilities category that answers the three most common percentage questions live as the user types.

**Architecture:** Five pure functions in `logic.ts` (three calculations returning `number | null`, one formatter, one direction describer), every user-facing string in `messages.ts`, and a `'use client'` component rendering three independent stacked shadcn cards. No exceptions are thrown — an uncomputable result is `null` and renders as an em dash.

**Tech Stack:** Next.js 14 App Router, React, TypeScript strict, Tailwind CSS, shadcn/ui, lucide-react, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-28-percentage-calculator-design.md`
**Issue:** [#76](https://github.com/hoferan/miniyard/issues/76)

## Global Constraints

- TypeScript strict mode — no `any`.
- Logic in `logic.ts` is pure: no React import, no DOM, no network, no strings of its own (it imports them from `messages.ts`).
- No inline styles — Tailwind utility classes only; use `cn()` from `@/lib/utils` for conditional classes.
- No new npm packages.
- Everything in the repository is written in English.
- Files `kebab-case`, components `PascalCase`, functions `camelCase`, types `PascalCase`, constants `UPPER_SNAKE_CASE`.
- Commits follow Conventional Commits.
- Every fenced code block in markdown carries a language identifier (MD040).
- The typographic minus in decrease output is U+2212 (`−`), not a hyphen.

## File Structure

| File | Responsibility |
|---|---|
| `src/modules/utilities/percentage-calculator/meta.ts` | Module metadata only |
| `src/modules/utilities/percentage-calculator/messages.ts` | Every user-facing string: card titles, input labels, aria labels, placeholder, direction words |
| `src/modules/utilities/percentage-calculator/logic.ts` | Five pure functions — the whole calculation surface |
| `src/modules/utilities/percentage-calculator/logic.test.ts` | Vitest unit tests for all five functions and every edge case |
| `src/modules/utilities/percentage-calculator/index.tsx` | Client component — three stacked cards, string-held input state |
| `tests/e2e/percentage-calculator.spec.ts` | Playwright flow across all three cards plus a screenshot |
| `src/lib/registry.ts` | Register the module |
| `src/components/utilities-module-content.tsx` | `componentMap` entry for dynamic import |
| `src/lib/icons.ts` | `'percent'` icon mapping |
| `README.md` | Utilities module list row |

---

### Task 1: Messages and metadata

**Files:**

- Create: `src/modules/utilities/percentage-calculator/messages.ts`
- Create: `src/modules/utilities/percentage-calculator/meta.ts`

**Interfaces:**

- Consumes: `Module` type from `@/lib/types`.
- Produces: `MESSAGES`, `ARIA`, `PLACEHOLDER`, `DIRECTION_WORDS` from `messages.ts`; `percentageCalculatorMeta` from `meta.ts`. Task 2's `logic.ts` imports `PLACEHOLDER` and `DIRECTION_WORDS`; Task 4's `index.tsx` imports `MESSAGES` and `ARIA`; Task 5 registers `percentageCalculatorMeta`.

- [ ] **Step 1: Write `messages.ts`**

```ts
/** Rendered whenever a result cannot be computed. */
export const PLACEHOLDER = '—'

export const DIRECTION_WORDS = {
  increase: 'increase',
  decrease: 'decrease',
  none: 'no change',
} as const

export const MESSAGES = {
  percentOfTitle: 'What is X% of Y?',
  percentOfPercentageLabel: 'Percentage',
  percentOfValueLabel: 'Of value',
  percentOfResultLabel: 'Result',

  whatPercentTitle: 'X is what % of Y?',
  whatPercentValueLabel: 'Value',
  whatPercentBaseLabel: 'Base',
  whatPercentResultLabel: 'Result',

  changeTitle: 'Percentage change from X to Y',
  changeOldLabel: 'Old value',
  changeNewLabel: 'New value',
  changeResultLabel: 'Result',
}

export const ARIA = {
  percentOfPercentage: 'Percentage for percent of value',
  percentOfValue: 'Value for percent of value',
  percentOfResult: 'Percent of value result',

  whatPercentValue: 'Value for what percent of base',
  whatPercentBase: 'Base for what percent of base',
  whatPercentResult: 'What percent of base result',

  changeOld: 'Old value for percentage change',
  changeNew: 'New value for percentage change',
  changeResult: 'Percentage change result',
}
```

- [ ] **Step 2: Write `meta.ts`**

```ts
import { Module } from '@/lib/types'

export const percentageCalculatorMeta: Module = {
  slug: 'percentage-calculator',
  title: 'Percentage Calculator',
  description:
    'Answer the three most common percentage questions — percent of a value, what percent one number is of another, and percentage change — all live as you type.',
  category: 'utilities',
  tags: ['math', 'percentage', 'calculator'],
  createdAt: '2026-08-28',
  icon: 'percent',
}
```

- [ ] **Step 3: Verify types compile**

Run: `npm run typecheck`
Expected: PASS (no errors; `messages.ts` and `meta.ts` are self-contained).

- [ ] **Step 4: Commit**

```bash
git add src/modules/utilities/percentage-calculator/messages.ts src/modules/utilities/percentage-calculator/meta.ts
git commit -m "feat(utilities): add percentage calculator metadata and messages"
```

---

### Task 2: Failing unit tests for the calculation logic

**Files:**

- Create: `src/modules/utilities/percentage-calculator/logic.test.ts`

**Interfaces:**

- Consumes: `PLACEHOLDER` and `DIRECTION_WORDS` from Task 1.
- Produces: the red test suite that Task 3 must turn green. It pins these five signatures:

```ts
percentOf(percentage: number, value: number): number | null
whatPercent(value: number, base: number): number | null
percentChange(oldValue: number, newValue: number): number | null
formatResult(value: number | null): string
describeChange(change: number | null): ChangeDescription
```

where `ChangeDescription = { text: string; direction: 'increase' | 'decrease' | 'none' }`.

- [ ] **Step 1: Write the complete failing test file**

```ts
import { describe, it, expect } from 'vitest'
import { percentOf, whatPercent, percentChange, formatResult, describeChange } from './logic'
import { PLACEHOLDER } from './messages'

describe('percentOf', () => {
  it('calculates 20% of 50 as 10', () => {
    expect(percentOf(20, 50)).toBeCloseTo(10)
  })

  it('calculates 100% of 42 as 42', () => {
    expect(percentOf(100, 42)).toBeCloseTo(42)
  })

  it('calculates 0% of 99 as 0', () => {
    expect(percentOf(0, 99)).toBe(0)
  })

  it('calculates a percentage of zero as 0', () => {
    expect(percentOf(25, 0)).toBe(0)
  })

  it('handles a percentage above 100', () => {
    expect(percentOf(150, 200)).toBeCloseTo(300)
  })

  it('handles a negative percentage', () => {
    expect(percentOf(-10, 50)).toBeCloseTo(-5)
  })

  it('handles a negative value', () => {
    expect(percentOf(10, -50)).toBeCloseTo(-5)
  })

  it('handles decimal input', () => {
    expect(percentOf(12.5, 80)).toBeCloseTo(10)
  })

  it('returns null for NaN input', () => {
    expect(percentOf(NaN, 50)).toBeNull()
    expect(percentOf(20, NaN)).toBeNull()
  })

  it('returns null for Infinity input', () => {
    expect(percentOf(Infinity, 50)).toBeNull()
    expect(percentOf(20, -Infinity)).toBeNull()
  })
})

describe('whatPercent', () => {
  it('calculates 10 of 50 as 20%', () => {
    expect(whatPercent(10, 50)).toBeCloseTo(20)
  })

  it('calculates 50 of 50 as 100%', () => {
    expect(whatPercent(50, 50)).toBeCloseTo(100)
  })

  it('calculates 0 of 50 as 0%', () => {
    expect(whatPercent(0, 50)).toBe(0)
  })

  it('calculates a value larger than the base as above 100%', () => {
    expect(whatPercent(75, 50)).toBeCloseTo(150)
  })

  it('handles a negative value', () => {
    expect(whatPercent(-10, 50)).toBeCloseTo(-20)
  })

  it('handles a negative base', () => {
    expect(whatPercent(10, -50)).toBeCloseTo(-20)
  })

  it('returns null when the base is zero', () => {
    expect(whatPercent(10, 0)).toBeNull()
  })

  it('returns null when the base is negative zero', () => {
    expect(whatPercent(10, -0)).toBeNull()
  })

  it('returns null for NaN input', () => {
    expect(whatPercent(NaN, 50)).toBeNull()
    expect(whatPercent(10, NaN)).toBeNull()
  })

  it('returns null for Infinity input', () => {
    expect(whatPercent(Infinity, 50)).toBeNull()
  })
})

describe('percentChange', () => {
  it('calculates an increase from 80 to 100 as 25%', () => {
    expect(percentChange(80, 100)).toBeCloseTo(25)
  })

  it('calculates a decrease from 100 to 90 as -10%', () => {
    expect(percentChange(100, 90)).toBeCloseTo(-10)
  })

  it('calculates no change as 0', () => {
    expect(percentChange(50, 50)).toBe(0)
  })

  it('calculates a doubling as 100%', () => {
    expect(percentChange(10, 20)).toBeCloseTo(100)
  })

  it('uses the absolute old value so a rise from -50 to -25 is a 50% increase', () => {
    expect(percentChange(-50, -25)).toBeCloseTo(50)
  })

  it('uses the absolute old value so a fall from -50 to -75 is a 50% decrease', () => {
    expect(percentChange(-50, -75)).toBeCloseTo(-50)
  })

  it('handles a sign flip from -10 to 10 as a 200% increase', () => {
    expect(percentChange(-10, 10)).toBeCloseTo(200)
  })

  it('returns null when the old value is zero', () => {
    expect(percentChange(0, 100)).toBeNull()
  })

  it('returns null for NaN input', () => {
    expect(percentChange(NaN, 100)).toBeNull()
    expect(percentChange(80, NaN)).toBeNull()
  })

  it('returns null for Infinity input', () => {
    expect(percentChange(80, Infinity)).toBeNull()
  })
})

describe('formatResult', () => {
  it('renders the placeholder for null', () => {
    expect(formatResult(null)).toBe(PLACEHOLDER)
  })

  it('strips trailing zeros from a whole number', () => {
    expect(formatResult(25)).toBe('25')
  })

  it('strips trailing zeros from a one-decimal number', () => {
    expect(formatResult(25.5)).toBe('25.5')
  })

  it('rounds to two decimal places', () => {
    expect(formatResult(33.3333)).toBe('33.33')
  })

  it('rounds a repeating two-thirds to 66.67', () => {
    expect(formatResult(66.6666)).toBe('66.67')
  })

  it('rounds 0.005 up to 0.01 without float artefacts', () => {
    expect(formatResult(0.005)).toBe('0.01')
  })

  it('formats zero as 0', () => {
    expect(formatResult(0)).toBe('0')
  })

  it('formats a negative number with a hyphen-minus', () => {
    expect(formatResult(-12.5)).toBe('-12.5')
  })

  it('formats a very small number as 0', () => {
    expect(formatResult(0.0001)).toBe('0')
  })

  it('formats a large number without exponential notation', () => {
    expect(formatResult(1234567.891)).toBe('1234567.89')
  })
})

describe('describeChange', () => {
  it('describes null as the placeholder with no direction', () => {
    expect(describeChange(null)).toEqual({ text: PLACEHOLDER, direction: 'none' })
  })

  it('describes a positive change as an increase with a plus sign', () => {
    expect(describeChange(25)).toEqual({ text: '+25% increase', direction: 'increase' })
  })

  it('describes a negative change as a decrease with a typographic minus', () => {
    expect(describeChange(-10)).toEqual({ text: '−10% decrease', direction: 'decrease' })
  })

  it('describes zero as no change', () => {
    expect(describeChange(0)).toEqual({ text: '0% — no change', direction: 'none' })
  })

  it('rounds the percentage inside the description', () => {
    expect(describeChange(33.3333)).toEqual({ text: '+33.33% increase', direction: 'increase' })
  })

  it('treats a value that rounds to zero as no change', () => {
    expect(describeChange(0.0001)).toEqual({ text: '0% — no change', direction: 'none' })
  })
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm run test -- percentage-calculator`
Expected: FAIL — the suite cannot resolve `./logic`, which does not exist yet.

- [ ] **Step 3: Commit the red tests**

```bash
git add src/modules/utilities/percentage-calculator/logic.test.ts
git commit -m "test(utilities): add failing tests for percentage calculator logic"
```

---

### Task 3: Implement the calculation logic

**Files:**

- Create: `src/modules/utilities/percentage-calculator/logic.ts`

**Interfaces:**

- Consumes: `PLACEHOLDER` and `DIRECTION_WORDS` from Task 1; the red suite from Task 2.
- Produces: `percentOf`, `whatPercent`, `percentChange`, `formatResult`, `describeChange`, and the exported type `ChangeDescription` — all consumed by Task 4's `index.tsx`.

- [ ] **Step 1: Write the implementation**

```ts
import { PLACEHOLDER, DIRECTION_WORDS } from './messages'

/** Number of decimal places every displayed result is rounded to. */
const DECIMAL_PLACES = 2

export type ChangeDirection = 'increase' | 'decrease' | 'none'

export type ChangeDescription = {
  text: string
  direction: ChangeDirection
}

function isUsable(...values: number[]): boolean {
  return values.every((value) => Number.isFinite(value))
}

/** What is `percentage`% of `value`? */
export function percentOf(percentage: number, value: number): number | null {
  if (!isUsable(percentage, value)) return null
  return (percentage / 100) * value
}

/** `value` is what percent of `base`? */
export function whatPercent(value: number, base: number): number | null {
  if (!isUsable(value, base)) return null
  if (base === 0) return null
  return (value / base) * 100
}

/** Percentage change from `oldValue` to `newValue`, relative to the magnitude of `oldValue`. */
export function percentChange(oldValue: number, newValue: number): number | null {
  if (!isUsable(oldValue, newValue)) return null
  if (oldValue === 0) return null
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100
}

/** Rounds to two decimals and strips trailing zeros; `null` becomes the placeholder. */
export function formatResult(value: number | null): string {
  if (value === null) return PLACEHOLDER
  const rounded = Number(value.toFixed(DECIMAL_PLACES))
  // toFixed already rounds; Number() then drops trailing zeros. Normalising -0 to 0
  // keeps a rounded-away negative from rendering as "-0".
  return String(rounded === 0 ? 0 : rounded)
}

/** Turns a change percentage into display text plus a direction for styling. */
export function describeChange(change: number | null): ChangeDescription {
  if (change === null) return { text: PLACEHOLDER, direction: 'none' }

  const rounded = Number(change.toFixed(DECIMAL_PLACES))

  if (rounded === 0) {
    return { text: `0% — ${DIRECTION_WORDS.none}`, direction: 'none' }
  }

  if (rounded > 0) {
    return { text: `+${rounded}% ${DIRECTION_WORDS.increase}`, direction: 'increase' }
  }

  return { text: `−${Math.abs(rounded)}% ${DIRECTION_WORDS.decrease}`, direction: 'decrease' }
}
```

- [ ] **Step 2: Run the tests and confirm they pass**

Run: `npm run test -- percentage-calculator`
Expected: PASS — all suites green.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/modules/utilities/percentage-calculator/logic.ts
git commit -m "feat(utilities): implement percentage calculator logic"
```

---

### Task 4: Build the UI component

**Files:**

- Create: `src/modules/utilities/percentage-calculator/index.tsx`

**Interfaces:**

- Consumes: `percentOf`, `whatPercent`, `percentChange`, `formatResult`, `describeChange`, `ChangeDirection` from Task 3; `MESSAGES`, `ARIA`, `PLACEHOLDER` from Task 1; `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card`; `Input` from `@/components/ui/input`; `cn` from `@/lib/utils`.
- Produces: the default-exported `PercentageCalculator` component that Task 5 wires into `componentMap`.

- [ ] **Step 1: Confirm the shadcn card component exists**

Run: `ls src/components/ui/card.tsx`
Expected: the path prints. If it is missing, add it with the `add-shadcn` skill before continuing.

- [ ] **Step 2: Write the component**

```tsx
'use client'

import { useState, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  percentOf,
  whatPercent,
  percentChange,
  formatResult,
  describeChange,
  type ChangeDirection,
} from './logic'
import { MESSAGES, ARIA, PLACEHOLDER } from './messages'

/** Inputs are held as strings so a half-typed "-" or "." does not reset the field. */
function toNumber(raw: string): number {
  return raw.trim() === '' ? NaN : Number(raw)
}

const DIRECTION_CLASSES: Record<ChangeDirection, string> = {
  increase: 'text-emerald-600 dark:text-emerald-400',
  decrease: 'text-rose-600 dark:text-rose-400',
  none: 'text-muted-foreground',
}

type FieldProps = {
  label: string
  ariaLabel: string
  value: string
  onChange: (value: string) => void
}

function NumberField({ label, ariaLabel, value, onChange }: FieldProps) {
  return (
    <label className="flex-1 min-w-0 space-y-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        aria-label={ariaLabel}
      />
    </label>
  )
}

function ResultRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-md bg-muted px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

export default function PercentageCalculator() {
  const [percentOfPercentage, setPercentOfPercentage] = useState('')
  const [percentOfValue, setPercentOfValue] = useState('')
  const [whatPercentValue, setWhatPercentValue] = useState('')
  const [whatPercentBase, setWhatPercentBase] = useState('')
  const [changeOld, setChangeOld] = useState('')
  const [changeNew, setChangeNew] = useState('')

  const percentOfResult = formatResult(
    percentOf(toNumber(percentOfPercentage), toNumber(percentOfValue))
  )
  const whatPercentResult = formatResult(
    whatPercent(toNumber(whatPercentValue), toNumber(whatPercentBase))
  )
  const change = describeChange(percentChange(toNumber(changeOld), toNumber(changeNew)))

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{MESSAGES.percentOfTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <NumberField
              label={MESSAGES.percentOfPercentageLabel}
              ariaLabel={ARIA.percentOfPercentage}
              value={percentOfPercentage}
              onChange={setPercentOfPercentage}
            />
            <NumberField
              label={MESSAGES.percentOfValueLabel}
              ariaLabel={ARIA.percentOfValue}
              value={percentOfValue}
              onChange={setPercentOfValue}
            />
          </div>
          <ResultRow label={MESSAGES.percentOfResultLabel}>
            <output aria-label={ARIA.percentOfResult} className="text-lg font-semibold tabular-nums">
              {percentOfResult}
            </output>
          </ResultRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{MESSAGES.whatPercentTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <NumberField
              label={MESSAGES.whatPercentValueLabel}
              ariaLabel={ARIA.whatPercentValue}
              value={whatPercentValue}
              onChange={setWhatPercentValue}
            />
            <NumberField
              label={MESSAGES.whatPercentBaseLabel}
              ariaLabel={ARIA.whatPercentBase}
              value={whatPercentBase}
              onChange={setWhatPercentBase}
            />
          </div>
          <ResultRow label={MESSAGES.whatPercentResultLabel}>
            <output
              aria-label={ARIA.whatPercentResult}
              className="text-lg font-semibold tabular-nums"
            >
              {whatPercentResult === PLACEHOLDER ? whatPercentResult : `${whatPercentResult}%`}
            </output>
          </ResultRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{MESSAGES.changeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <NumberField
              label={MESSAGES.changeOldLabel}
              ariaLabel={ARIA.changeOld}
              value={changeOld}
              onChange={setChangeOld}
            />
            <NumberField
              label={MESSAGES.changeNewLabel}
              ariaLabel={ARIA.changeNew}
              value={changeNew}
              onChange={setChangeNew}
            />
          </div>
          <ResultRow label={MESSAGES.changeResultLabel}>
            <output
              aria-label={ARIA.changeResult}
              className={cn('text-lg font-semibold tabular-nums', DIRECTION_CLASSES[change.direction])}
            >
              {change.text}
            </output>
          </ResultRow>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS both.

- [ ] **Step 4: Commit**

```bash
git add src/modules/utilities/percentage-calculator/index.tsx
git commit -m "feat(utilities): add percentage calculator UI"
```

---

### Task 5: Register the module

**Files:**

- Modify: `src/lib/registry.ts`
- Modify: `src/components/utilities-module-content.tsx`
- Modify: `src/lib/icons.ts`

**Interfaces:**

- Consumes: `percentageCalculatorMeta` from Task 1, the default export from Task 4.
- Produces: a reachable `/utilities/percentage-calculator` route, which Task 6's E2E test navigates to.

- [ ] **Step 1: Add the icon mapping**

In `src/lib/icons.ts`, add `Percent` to the existing `lucide-react` import and add the map entry:

```ts
  'percent': Percent,
```

- [ ] **Step 2: Register the metadata**

In `src/lib/registry.ts`, add the import next to the other utilities imports:

```ts
import { percentageCalculatorMeta } from '@/modules/utilities/percentage-calculator/meta'
```

and append `percentageCalculatorMeta` to the `registry` array after `textCaseConverterMeta`.

- [ ] **Step 3: Add the componentMap entry**

In `src/components/utilities-module-content.tsx`, add to `componentMap`:

```ts
  'percentage-calculator': dynamic(() => import('@/modules/utilities/percentage-calculator'), { loading: ModuleSkeleton, ssr: false }),
```

- [ ] **Step 4: Verify the route builds**

Run: `npm run build`
Expected: PASS, and the build output lists `/utilities/percentage-calculator` as a statically generated route.

- [ ] **Step 5: Commit**

```bash
git add src/lib/registry.ts src/components/utilities-module-content.tsx src/lib/icons.ts
git commit -m "feat(utilities): register percentage calculator module"
```

---

### Task 6: E2E test

**Files:**

- Create: `tests/e2e/percentage-calculator.spec.ts`

**Interfaces:**

- Consumes: the route from Task 5 and the aria labels from Task 1.
- Produces: a screenshot artefact at `test-results/percentage-calculator-idle.png`.

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '@playwright/test'

test.describe('Percentage Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/percentage-calculator')
  })

  test('loads with all three results showing the placeholder', async ({ page }) => {
    await expect(page.getByLabel('Percent of value result')).toHaveText('—')
    await expect(page.getByLabel('What percent of base result')).toHaveText('—')
    await expect(page.getByLabel('Percentage change result')).toHaveText('—')
    await page.screenshot({ path: 'test-results/percentage-calculator-idle.png' })
  })

  test('calculates what 20% of 50 is', async ({ page }) => {
    await page.getByLabel('Percentage for percent of value').fill('20')
    await page.getByLabel('Value for percent of value').fill('50')
    await expect(page.getByLabel('Percent of value result')).toHaveText('10')
  })

  test('calculates what percent 10 is of 50', async ({ page }) => {
    await page.getByLabel('Value for what percent of base').fill('10')
    await page.getByLabel('Base for what percent of base').fill('50')
    await expect(page.getByLabel('What percent of base result')).toHaveText('20%')
  })

  test('shows the placeholder when the base is zero', async ({ page }) => {
    await page.getByLabel('Value for what percent of base').fill('10')
    await page.getByLabel('Base for what percent of base').fill('0')
    await expect(page.getByLabel('What percent of base result')).toHaveText('—')
  })

  test('describes an increase and a decrease', async ({ page }) => {
    await page.getByLabel('Old value for percentage change').fill('80')
    await page.getByLabel('New value for percentage change').fill('100')
    await expect(page.getByLabel('Percentage change result')).toHaveText('+25% increase')

    await page.getByLabel('Old value for percentage change').fill('100')
    await page.getByLabel('New value for percentage change').fill('90')
    await expect(page.getByLabel('Percentage change result')).toHaveText('−10% decrease')
  })
})
```

- [ ] **Step 2: Run the E2E suite for this module**

Run: `npm run test:e2e -- percentage-calculator`
Expected: PASS — all five tests green.

- [ ] **Step 3: Review the screenshot**

Open `test-results/percentage-calculator-idle.png` and confirm three stacked cards render with labelled inputs and em-dash results.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/percentage-calculator.spec.ts
git commit -m "test(utilities): add percentage calculator E2E test"
```

---

### Task 7: Documentation and full verification

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Add the module to the README utilities table**

Append this row after the Text Case Converter row:

```markdown
| [Percentage Calculator](src/modules/utilities/percentage-calculator) | Answer the three most common percentage questions — percent of a value, what percent one number is of another, and percentage change — all live as you type. |
```

- [ ] **Step 2: Run the full verification suite**

```bash
npm run test
npm run typecheck
npm run lint
npm run lint:md
npm run build
npm run test:e2e
```

Expected: every command exits zero.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Percentage Calculator to the module list"
```

---

## Self-Review

**Spec coverage:** All three modes (Tasks 2–4), `null`-based error handling (Tasks 2–3), 2-decimal rounding with trailing-zero stripping (`formatResult`, Task 3), direction wording including the zero case (`describeChange`, Task 3), stacked-card layout with string-held input state (Task 4), registration in all three places (Task 5), unit and E2E tests (Tasks 2 and 6), README update (Task 7). Every edge case in the spec table has a named test in Task 2.

**Placeholder scan:** No TBDs. Every code step shows complete code; every command lists its expected outcome.

**Type consistency:** `percentOf`, `whatPercent`, `percentChange`, `formatResult`, `describeChange`, `ChangeDescription`, and `ChangeDirection` are named identically in Tasks 2, 3, and 4. `PLACEHOLDER` and `DIRECTION_WORDS` are defined in Task 1 and consumed unchanged. The aria label strings in Task 1 match the Playwright selectors in Task 6 exactly.
