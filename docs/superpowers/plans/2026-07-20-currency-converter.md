# Currency Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a keyless "Currency Converter" module to the `apis` category that converts an amount between two currencies using live ECB reference rates from the Frankfurter API.

**Architecture:** `index.tsx` (client UI) calls `api.ts` (client fetch wrapper), which calls this app's own server proxy Route Handler at `src/app/api/apis/currency-converter/route.ts`. The proxy calls `api.frankfurter.dev/v2` server-side and normalizes the response/errors. All pure work (validation, parsing upstream JSON, the conversion math, and display formatting) lives in `logic.ts` and is unit-tested; it never imports React or does any fetching.

**Tech Stack:** Next.js 14 App Router (Route Handler), React client component, TypeScript strict, Tailwind, shadcn/ui (Button, Input, Label, Select, Card, Skeleton), Vitest, Playwright, Sentry.

## Spec: Currency Converter

Category: apis
Function: Convert a numeric amount from one currency to another using live ECB reference rates from Frankfurter, showing the converted amount, the unit exchange rate, and the rate date.

Inputs:
- amount — string from a number input; validated to a finite number ≥ 0 (empty / NaN / negative rejected; `0` allowed)
- from — currency code (ISO 4217), chosen from a dynamically fetched list
- to — currency code (ISO 4217), chosen from a dynamically fetched list

Outputs:
- converted amount (formatted, 2 decimals, grouped)
- unit exchange rate (e.g. `1 USD = 0.8738 EUR`)
- rate date (e.g. `Rates as of 2026-07-20`)

Logic / Algorithm:
- Currency list: `GET /api/apis/currency-converter?op=currencies` → proxy → `GET /v2/currencies` → normalize `{iso_code,name}[]` to `{code,name}[]` sorted by code.
- Conversion: validate amount → if `from === to`, short-circuit to rate `1.0` (no API call) → else `GET /api/apis/currency-converter?from=X&to=Y` → proxy → `GET /v2/rates?base=X&quotes=Y` → parse first element `{date,base,quote,rate}` → `converted = amount * rate`.

Edge Cases:
- Empty amount → error "Enter an amount".
- Non-numeric amount → error "Enter a valid number".
- Negative amount → error "Amount can't be negative".
- Amount `0` → allowed, result `0`.
- `from === to` → rate `1.0`, converted = amount, no network call.
- Invalid currency (upstream 404/422) → error "One of the selected currencies isn't supported".
- Empty rate array from upstream → treated as upstream error.
- Network failure → error "Couldn't reach the exchange-rate service".
- Currency-list fetch fails on mount → disable the form + show a load error.

New files:
- src/modules/apis/currency-converter/meta.ts
- src/modules/apis/currency-converter/logic.ts
- src/modules/apis/currency-converter/logic.test.ts
- src/modules/apis/currency-converter/api.ts
- src/modules/apis/currency-converter/messages.ts
- src/modules/apis/currency-converter/index.tsx
- src/app/api/apis/currency-converter/route.ts
- tests/e2e/currency-converter.spec.ts

Registration:
- src/lib/registry.ts
- src/components/apis-module-content.tsx (componentMap)

Documentation:
- README.md (APIs table)

## Global Constraints

- TypeScript strict mode — no `any`.
- No new npm dependencies (Frankfurter is keyless; `fetch` is built in).
- No API key, no `.env` entry — Frankfurter is public and keyless.
- Pure logic in `logic.ts` — no React import, no DOM, no `fetch`.
- User-facing strings live in `messages.ts`; `logic.ts` returns error *keys*, never prose.
- Tailwind utility classes only — no inline styles. Errors render with the shadcn `Alert` component (`variant="destructive"`).
- `'use client'` only in `index.tsx`.
- Unexpected errors in the Route Handler go through `Sentry.captureException`.
- E2E mocks the proxy route — never hits the real Frankfurter API.
- Conventional Commits; commit after each task.

---

### Task 1: Module metadata (`meta.ts`)

**Files:**
- Create: `src/modules/apis/currency-converter/meta.ts`

**Interfaces:**
- Consumes: `Module` type from `src/lib/types.ts`.
- Produces: `export const currencyConverterMeta: Module` (imported by `registry.ts` in Task 6).

- [ ] **Step 1: Write `meta.ts`**

```ts
import { Module } from '@/lib/types'

export const currencyConverterMeta: Module = {
  slug: 'currency-converter',
  title: 'Currency Converter',
  description: 'Convert between currencies using live European Central Bank reference rates.',
  category: 'apis',
  tags: ['currency', 'money', 'exchange-rate', 'finance'],
  createdAt: '2026-07-20',
  icon: 'coins',
}
```

- [ ] **Step 2: Confirm the `coins` icon exists**

Run: check `src/lib/icons.ts` for a `coins` entry; if missing, add `Coins` from `lucide-react` under key `coins`.

- [ ] **Step 3: Commit**

```bash
git add src/modules/apis/currency-converter/meta.ts src/lib/icons.ts
git commit -m "feat: add currency-converter module metadata"
```

---

### Task 2: Pure logic + tests (`logic.ts`, `logic.test.ts`)

**Files:**
- Create: `src/modules/apis/currency-converter/logic.ts`
- Test: `src/modules/apis/currency-converter/logic.test.ts`

**Interfaces:**
- Produces (consumed by `api.ts`, `index.tsx`, and the route in later tasks):

```ts
export type Currency = { code: string; name: string }
export type RateResult = { base: string; quote: string; rate: number; date: string }
export type AmountValidation =
  | { valid: true; value: number }
  | { valid: false; errorKey: 'empty' | 'notNumber' | 'negative' }

export function parseCurrencies(raw: unknown): Currency[]
export function parseRate(raw: unknown): RateResult
export function validateAmount(input: string): AmountValidation
export function isSameCurrency(from: string, to: string): boolean
export function convert(amount: number, rate: number): number
export function formatAmount(value: number): string
export function formatRate(rate: number): string
```

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import {
  parseCurrencies,
  parseRate,
  validateAmount,
  isSameCurrency,
  convert,
  formatAmount,
  formatRate,
} from './logic'

describe('parseCurrencies', () => {
  it('maps iso_code→code and sorts by code', () => {
    const raw = [
      { iso_code: 'USD', name: 'US Dollar' },
      { iso_code: 'EUR', name: 'Euro' },
    ]
    expect(parseCurrencies(raw)).toEqual([
      { code: 'EUR', name: 'Euro' },
      { code: 'USD', name: 'US Dollar' },
    ])
  })

  it('drops entries missing a code or name', () => {
    const raw = [{ iso_code: 'USD', name: 'US Dollar' }, { iso_code: '', name: 'x' }, { name: 'y' }]
    expect(parseCurrencies(raw)).toEqual([{ code: 'USD', name: 'US Dollar' }])
  })

  it('throws when the payload is not an array', () => {
    expect(() => parseCurrencies({ nope: true })).toThrow()
  })
})

describe('parseRate', () => {
  it('extracts the first element of the rates array', () => {
    const raw = [{ date: '2026-07-20', base: 'USD', quote: 'EUR', rate: 0.87381 }]
    expect(parseRate(raw)).toEqual({ base: 'USD', quote: 'EUR', rate: 0.87381, date: '2026-07-20' })
  })

  it('throws on an empty array', () => {
    expect(() => parseRate([])).toThrow()
  })

  it('throws when rate is not a number', () => {
    expect(() => parseRate([{ date: '2026-07-20', base: 'USD', quote: 'EUR', rate: 'x' }])).toThrow()
  })
})

describe('validateAmount', () => {
  it('rejects an empty string', () => {
    expect(validateAmount('')).toEqual({ valid: false, errorKey: 'empty' })
  })
  it('rejects whitespace only', () => {
    expect(validateAmount('   ')).toEqual({ valid: false, errorKey: 'empty' })
  })
  it('rejects a non-number', () => {
    expect(validateAmount('abc')).toEqual({ valid: false, errorKey: 'notNumber' })
  })
  it('rejects a negative number', () => {
    expect(validateAmount('-5')).toEqual({ valid: false, errorKey: 'negative' })
  })
  it('accepts zero', () => {
    expect(validateAmount('0')).toEqual({ valid: true, value: 0 })
  })
  it('accepts a decimal', () => {
    expect(validateAmount('12.5')).toEqual({ valid: true, value: 12.5 })
  })
})

describe('isSameCurrency', () => {
  it('is true for identical codes', () => {
    expect(isSameCurrency('USD', 'USD')).toBe(true)
  })
  it('is false for different codes', () => {
    expect(isSameCurrency('USD', 'EUR')).toBe(false)
  })
})

describe('convert', () => {
  it('multiplies amount by rate', () => {
    expect(convert(100, 0.87381)).toBeCloseTo(87.381)
  })
  it('returns 0 for a zero amount', () => {
    expect(convert(0, 0.87381)).toBe(0)
  })
  it('is identity for rate 1', () => {
    expect(convert(42, 1)).toBe(42)
  })
})

describe('formatAmount', () => {
  it('formats to two decimals with grouping', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50')
  })
  it('formats zero', () => {
    expect(formatAmount(0)).toBe('0.00')
  })
})

describe('formatRate', () => {
  it('formats to at most four decimals', () => {
    expect(formatRate(0.873814)).toBe('0.8738')
  })
})
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm run test -- currency-converter`
Expected: FAIL (`Cannot find module './logic'`).

- [ ] **Step 3: Implement `logic.ts`**

```ts
export type Currency = { code: string; name: string }
export type RateResult = { base: string; quote: string; rate: number; date: string }
export type AmountValidation =
  | { valid: true; value: number }
  | { valid: false; errorKey: 'empty' | 'notNumber' | 'negative' }

export function parseCurrencies(raw: unknown): Currency[] {
  if (!Array.isArray(raw)) throw new Error('Unexpected currencies payload')
  return raw
    .map((entry) => {
      const e = entry as Record<string, unknown>
      return { code: String(e.iso_code ?? ''), name: String(e.name ?? '') }
    })
    .filter((c) => c.code !== '' && c.name !== '' && c.name !== 'undefined')
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function parseRate(raw: unknown): RateResult {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Unexpected rate payload')
  const first = raw[0] as Record<string, unknown>
  const rate = first.rate
  if (typeof rate !== 'number' || !Number.isFinite(rate)) throw new Error('Unexpected rate value')
  return {
    base: String(first.base ?? ''),
    quote: String(first.quote ?? ''),
    rate,
    date: String(first.date ?? ''),
  }
}

export function validateAmount(input: string): AmountValidation {
  const trimmed = input.trim()
  if (trimmed === '') return { valid: false, errorKey: 'empty' }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return { valid: false, errorKey: 'notNumber' }
  if (value < 0) return { valid: false, errorKey: 'negative' }
  return { valid: true, value }
}

export function isSameCurrency(from: string, to: string): boolean {
  return from === to
}

export function convert(amount: number, rate: number): number {
  return amount * rate
}

export function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRate(rate: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(rate)
}
```

Note: `.filter(... c.name !== 'undefined')` guards the `String(undefined)` case from a missing `name`.

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm run test -- currency-converter`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/modules/apis/currency-converter/logic.ts src/modules/apis/currency-converter/logic.test.ts
git commit -m "feat: add currency-converter pure logic with tests"
```

---

### Task 3: User-facing strings (`messages.ts`)

**Files:**
- Create: `src/modules/apis/currency-converter/messages.ts`

**Interfaces:**
- Produces: `MESSAGES` and `ARIA` objects consumed by `index.tsx`. `MESSAGES.errors` is keyed by `logic.ts` error keys plus proxy error codes.

- [ ] **Step 1: Write `messages.ts`**

```ts
export const MESSAGES = {
  amountLabel: 'Amount',
  amountPlaceholder: '0.00',
  fromLabel: 'From',
  toLabel: 'To',
  convertButton: 'Convert',
  loadingCurrencies: 'Loading currencies…',
  converting: 'Converting…',
  attribution: 'Exchange rates from Frankfurter (European Central Bank)',
  attributionUrl: 'https://frankfurter.dev',
  unitRate: (from: string, rate: string, to: string) => `1 ${from} = ${rate} ${to}`,
  asOf: (date: string) => `Rates as of ${date}`,
  errors: {
    empty: 'Enter an amount.',
    notNumber: 'Enter a valid number.',
    negative: "Amount can't be negative.",
    invalid_currency: "One of the selected currencies isn't supported.",
    upstream: 'The exchange-rate service returned an error. Please try again.',
    network: "Couldn't reach the exchange-rate service. Check your connection.",
    currencyLoad: "Couldn't load the currency list. Please refresh.",
  },
} as const

export const ARIA = {
  amount: 'Amount to convert',
  from: 'Convert from currency',
  to: 'Convert to currency',
  swap: 'Swap currencies',
} as const

export type ErrorKey = keyof typeof MESSAGES.errors
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/apis/currency-converter/messages.ts
git commit -m "feat: add currency-converter user-facing strings"
```

---

### Task 4: Server proxy Route Handler (`route.ts`)

**Files:**
- Create: `src/app/api/apis/currency-converter/route.ts`

**Interfaces:**
- Consumes: nothing from other tasks (calls Frankfurter directly, returns plain JSON).
- Produces the proxy contract that `api.ts` (Task 5) depends on:
  - `GET ?op=currencies` → `200` `Currency[]` (`{code,name}[]`) or `{ error: 'upstream' | 'network' }` with status `502`.
  - `GET ?from=X&to=Y` → `200` `RateResult` (`{base,quote,rate,date}`) or `{ error: 'invalid_currency' }` (`400`) / `{ error: 'upstream' | 'network' }` (`502`).

- [ ] **Step 1: Write `route.ts`**

```ts
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { parseCurrencies, parseRate } from '@/modules/apis/currency-converter/logic'

const FRANKFURTER = 'https://api.frankfurter.dev/v2'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const op = searchParams.get('op')

  try {
    if (op === 'currencies') {
      const upstream = await fetch(`${FRANKFURTER}/currencies`, { next: { revalidate: 86400 } })
      if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })
      const data = await upstream.json()
      return NextResponse.json(parseCurrencies(data))
    }

    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (!from || !to) return NextResponse.json({ error: 'invalid_currency' }, { status: 400 })

    const url = `${FRANKFURTER}/rates?base=${encodeURIComponent(from)}&quotes=${encodeURIComponent(to)}`
    const upstream = await fetch(url, { next: { revalidate: 3600 } })
    if (upstream.status === 404 || upstream.status === 422) {
      return NextResponse.json({ error: 'invalid_currency' }, { status: 400 })
    }
    if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })
    const data = await upstream.json()
    return NextResponse.json(parseRate(data))
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'network' }, { status: 502 })
  }
}
```

- [ ] **Step 2: Verify `@sentry/nextjs` is already a dependency**

Run: `grep '@sentry/nextjs' package.json`
Expected: a pinned version is listed. (If absent, use the existing Sentry import path already used elsewhere in the repo instead of adding a package.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/apis/currency-converter/route.ts
git commit -m "feat: add currency-converter server proxy route"
```

---

### Task 5: Client fetch wrapper (`api.ts`)

**Files:**
- Create: `src/modules/apis/currency-converter/api.ts`

**Interfaces:**
- Consumes: `Currency`, `RateResult` types from `logic.ts`; the proxy contract from Task 4.
- Produces:
  - `fetchCurrencies(): Promise<Currency[]>` — throws `Error('currencyLoad')` on failure.
  - `fetchRate(from: string, to: string): Promise<RateResult>` — throws `Error(errorKey)` where `errorKey` is one of `'invalid_currency' | 'upstream' | 'network'`.

- [ ] **Step 1: Write `api.ts`**

```ts
import type { Currency, RateResult } from './logic'

const BASE = '/api/apis/currency-converter'

export async function fetchCurrencies(): Promise<Currency[]> {
  try {
    const res = await fetch(`${BASE}?op=currencies`)
    if (!res.ok) throw new Error('currencyLoad')
    return (await res.json()) as Currency[]
  } catch {
    throw new Error('currencyLoad')
  }
}

export async function fetchRate(from: string, to: string): Promise<RateResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  } catch {
    throw new Error('network')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'upstream')
  }
  return (await res.json()) as RateResult
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/modules/apis/currency-converter/api.ts
git commit -m "feat: add currency-converter client fetch wrapper"
```

---

### Task 6: UI component (`index.tsx`) + registration

**Files:**
- Create: `src/modules/apis/currency-converter/index.tsx`
- Modify: `src/lib/registry.ts` (import + append to `registry` array)
- Modify: `src/components/apis-module-content.tsx` (add to `componentMap`)

**Interfaces:**
- Consumes: `fetchCurrencies`, `fetchRate` from `api.ts`; `validateAmount`, `isSameCurrency`, `convert`, `formatAmount`, `formatRate`, `RateResult` from `logic.ts`; `MESSAGES`, `ARIA`, `ErrorKey` from `messages.ts`; `currencyConverterMeta` from `meta.ts`.
- Produces: default-exported `CurrencyConverter` component.

- [ ] **Step 1: Write `index.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  convert,
  formatAmount,
  formatRate,
  isSameCurrency,
  validateAmount,
  type Currency,
  type RateResult,
} from './logic'
import { fetchCurrencies, fetchRate } from './api'
import { ARIA, MESSAGES, type ErrorKey } from './messages'

type Result = { amount: number; rate: RateResult; from: string; to: string }

function pickDefault(codes: string[], preferred: string, fallbackIndex: number): string {
  return codes.includes(preferred) ? preferred : (codes[fallbackIndex] ?? codes[0] ?? '')
}

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(true)
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<ErrorKey | null>(null)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    let active = true
    fetchCurrencies()
      .then((list) => {
        if (!active) return
        setCurrencies(list)
        const codes = list.map((c) => c.code)
        setFrom(pickDefault(codes, 'USD', 0))
        setTo(pickDefault(codes, 'EUR', 1))
      })
      .catch(() => active && setError('currencyLoad'))
      .finally(() => active && setLoadingCurrencies(false))
    return () => {
      active = false
    }
  }, [])

  async function handleConvert() {
    setError(null)
    setResult(null)
    const validation = validateAmount(amount)
    if (!validation.valid) {
      setError(validation.errorKey)
      return
    }
    if (isSameCurrency(from, to)) {
      setResult({
        amount: validation.value,
        from,
        to,
        rate: { base: from, quote: to, rate: 1, date: '' },
      })
      return
    }
    setConverting(true)
    try {
      const rate = await fetchRate(from, to)
      setResult({ amount: validation.value, rate, from, to })
    } catch (e) {
      const key = (e as Error).message
      setError((key in MESSAGES.errors ? key : 'upstream') as ErrorKey)
    } finally {
      setConverting(false)
    }
  }

  function handleSwap() {
    setFrom(to)
    setTo(from)
    setResult(null)
  }

  if (loadingCurrencies) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">{MESSAGES.amountLabel}</Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={MESSAGES.amountPlaceholder}
          aria-label={ARIA.amount}
        />
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <Label>{MESSAGES.fromLabel}</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger aria-label={ARIA.from}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          aria-label={ARIA.swap}
          className="shrink-0"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0 space-y-2">
          <Label>{MESSAGES.toLabel}</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger aria-label={ARIA.to}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleConvert} disabled={converting} className="w-full">
        {converting ? MESSAGES.converting : MESSAGES.convertButton}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{MESSAGES.errors[error]}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="rounded-lg border bg-card p-6 text-center space-y-2">
          <p className="text-3xl font-bold">
            {formatAmount(convert(result.amount, result.rate.rate))} {result.to}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatAmount(result.amount)} {result.from}
          </p>
          <p className="text-sm text-muted-foreground">
            {MESSAGES.unitRate(result.from, formatRate(result.rate.rate), result.to)}
          </p>
          {result.rate.date && (
            <p className="text-xs text-muted-foreground">{MESSAGES.asOf(result.rate.date)}</p>
          )}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <a
          href={MESSAGES.attributionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          {MESSAGES.attribution}
        </a>
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Register in `src/lib/registry.ts`**

Add the import alongside the other meta imports:

```ts
import { currencyConverterMeta } from '@/modules/apis/currency-converter/meta'
```

Append `currencyConverterMeta` to the `registry` array.

- [ ] **Step 3: Add to `componentMap` in `src/components/apis-module-content.tsx`**

Add the `dynamic` import (mirror the commented example) and register the slug:

```tsx
'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap: Record<string, ComponentType> = {
  'currency-converter': dynamic(() => import('@/modules/apis/currency-converter'), {
    loading: ModuleSkeleton,
    ssr: false,
  }),
}
```

Note: confirm the correct skeleton import used by the sibling `utilities-module-content.tsx` / `games-module-content.tsx` and match it exactly (component name and path).

- [ ] **Step 4: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS; `/apis/currency-converter` appears as a statically generated route.

- [ ] **Step 5: Commit**

```bash
git add src/modules/apis/currency-converter/index.tsx src/lib/registry.ts src/components/apis-module-content.tsx
git commit -m "feat: add currency-converter UI and register module"
```

---

### Task 7: E2E test (`currency-converter.spec.ts`)

**Files:**
- Create: `tests/e2e/currency-converter.spec.ts`

**Interfaces:**
- Consumes: the live page at `/apis/currency-converter`; mocks the proxy route `**/api/apis/currency-converter**`.

- [ ] **Step 1: Write the E2E test**

```ts
import { test, expect } from '@playwright/test'

const CURRENCIES = [
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'USD', name: 'US Dollar' },
]

test.describe('Currency Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/apis/currency-converter**', async (route) => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('op') === 'currencies') {
        await route.fulfill({ json: CURRENCIES })
        return
      }
      await route.fulfill({
        json: { base: 'USD', quote: 'EUR', rate: 0.87381, date: '2026-07-20' },
      })
    })
    await page.goto('/apis/currency-converter')
  })

  test('loads controls and converts an amount', async ({ page }) => {
    await expect(page.getByLabel('Amount to convert')).toBeVisible()
    await page.getByLabel('Amount to convert').fill('100')
    await page.getByRole('button', { name: 'Convert' }).click()
    await expect(page.getByText('87.38 EUR')).toBeVisible()
    await expect(page.getByText('1 USD = 0.8738 EUR')).toBeVisible()
    await expect(page.getByText('Rates as of 2026-07-20')).toBeVisible()
    await page.screenshot({ path: 'test-results/currency-converter-result.png' })
  })

  test('shows an error for an empty amount', async ({ page }) => {
    await page.getByLabel('Amount to convert').fill('')
    await page.getByRole('button', { name: 'Convert' }).click()
    await expect(page.getByRole('alert')).toContainText('Enter an amount.')
  })
})
```

- [ ] **Step 2: Run the E2E test**

Run: `npm run test:e2e -- currency-converter`
Expected: PASS; `test-results/currency-converter-result.png` produced.

- [ ] **Step 3: Review the screenshot**

Open `test-results/currency-converter-result.png` and confirm the result card renders correctly.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/currency-converter.spec.ts
git commit -m "test: add currency-converter E2E test"
```

---

### Task 8: Documentation + final verification

**Files:**
- Modify: `README.md` (APIs category table)

- [ ] **Step 1: Add the module to the APIs table in `README.md`**

Add a row for Currency Converter under the APIs category section (match the existing table format used for utilities/games).

- [ ] **Step 2: Run `/update-docs`**

Confirm no other doc surface (CLAUDE.md, category README) is stale.

- [ ] **Step 3: Full verification suite**

Run:
```bash
npm run test
npm run typecheck
npm run build
npm run test:e2e -- currency-converter
```
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add currency-converter to APIs module list"
```

---

## Self-Review

**Spec coverage:** amount validation (Task 2) · dynamic currency list (Tasks 4/5/6) · conversion + same-currency short-circuit (Tasks 2/6) · rate + date display (Task 6) · all error states (Tasks 3/4/5/6) · attribution (Tasks 3/6) · proxy pattern (Task 4) · registration (Task 6) · E2E with screenshot (Task 7) · docs (Task 8). All covered.

**Placeholder scan:** No TBD/TODO; every code step shows complete code. Two verification notes (icon existence, skeleton import name) are explicit checks, not placeholders.

**Type consistency:** `Currency`, `RateResult`, `AmountValidation`, `ErrorKey` defined in Tasks 2/3 and consumed with matching names/shapes in Tasks 4/5/6. `fetchCurrencies`/`fetchRate` signatures match between Task 5 (producer) and Task 6 (consumer). Proxy error codes (`invalid_currency`, `upstream`, `network`) align with `MESSAGES.errors` keys.
