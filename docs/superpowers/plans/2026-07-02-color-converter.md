# Color Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `color-converter` utility module that converts colors between HEX, RGB, and HSL (including alpha/transparency) with a live swatch preview, keeping all three formats synced in real time as any field is edited.

**Architecture:** A single canonical `Rgba` value (`{ r, g, b, a }`) is the source of truth in `index.tsx` state. `logic.ts` holds pure conversion/validation/formatting functions with no React or DOM dependency. HEX and HSL are derived display values re-computed from the canonical `Rgba` whenever a different section produces a valid edit; the section currently being typed into keeps the user's raw text untouched until it parses.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, shadcn/ui (`Input`, `Label`), lucide-react (`Pipette`), the existing shared `CopyButton` component, Vitest (unit), Playwright (E2E).

## Global Constraints

- No external npm packages — all conversions are pure math, no color library
- All user-facing strings in `messages.ts`; `logic.ts` imports nothing from `messages.ts`
- `'use client'` required (live input state)
- No inline styles except the swatch's dynamic `backgroundColor` (matches existing precedent in `src/modules/games/snake/index.tsx:132` and `src/components/ui/progress.tsx:25` for values that cannot be expressed as static Tailwind classes) — the checkerboard pattern itself is static and MUST be a Tailwind arbitrary-value class, not inline style
- Pin exact npm versions (no `^` or `~`) if any package is added — none needed here
- Slug: `color-converter`; module directory: `src/modules/utilities/color-converter/`
- Canonical state type: `Rgba = { r: number; g: number; b: number; a: number }` — r/g/b are integers 0–255, a is a float 0–1
- Default color on load: `{ r: 59, g: 130, b: 246, a: 1 }` (`#3b82f6`)
- RGB alpha field and HSL alpha field are both entered/displayed as a percentage 0–100 in the UI, converted to/from the internal 0–1 float
- A field that fails to parse shows an inline error under its own section only and does NOT change canonical state, the other two sections, or the swatch
- Branch: current branch (`claude/new-session-mlu5l1`) — do not create a new branch; commit with Conventional Commits prefixes (`feat:`, `test:`, `docs:`, `refactor:`)

---

## Task 1: Module metadata and icon

**Files:**
- Create: `src/modules/utilities/color-converter/meta.ts`
- Modify: `src/lib/icons.ts`

**Interfaces:**
- Produces: `colorConverterMeta` (imported by Task 7)

- [ ] **Step 1: Create `meta.ts`**

```typescript
import { Module } from '@/lib/types'

export const colorConverterMeta: Module = {
  slug: 'color-converter',
  title: 'Color Converter',
  description: 'Convert colors between HEX, RGB, and HSL with alpha support — synced in real time with a live preview swatch.',
  category: 'utilities',
  tags: ['color', 'conversion', 'css', 'developer', 'design'],
  createdAt: '2026-07-02',
  icon: 'pipette',
}
```

- [ ] **Step 2: Add the `pipette` icon to `src/lib/icons.ts`**

Replace the full file content:

```typescript
import { Ruler, Code2, ShieldCheck, LayoutGrid, Keyboard, Zap, Worm, Pipette } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  'ruler': Ruler,
  'code-2': Code2,
  'shield-check': ShieldCheck,
  'layout-grid': LayoutGrid,
  'keyboard': Keyboard,
  'zap': Zap,
  'worm': Worm,
  'pipette': Pipette,
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/utilities/color-converter/meta.ts src/lib/icons.ts
git commit -m "feat: add color-converter metadata and pipette icon"
```

---

## Task 2: Failing unit tests (TDD — red phase)

**Files:**
- Create: `src/modules/utilities/color-converter/logic.test.ts`

**Interfaces:**
- Consumes: `hexToRgba`, `rgbaToHex`, `rgbToHsl`, `hslToRgb`, `rgbaToHsla`, `hslaToRgba`, `parseHexInput`, `parseRgbInput`, `parseHslInput`, `formatRgbaString`, `formatHslaString`, `DEFAULT_COLOR` from `./logic` (none exist yet — tests will fail to import)
- Produces: verified-red test suite that Task 3 must make green

- [ ] **Step 1: Create `logic.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import {
  DEFAULT_COLOR,
  formatHslaString,
  formatRgbaString,
  hexToRgba,
  hslToRgb,
  hslaToRgba,
  parseHexInput,
  parseHslInput,
  parseRgbInput,
  rgbToHsl,
  rgbaToHex,
  rgbaToHsla,
} from './logic'

describe('DEFAULT_COLOR', () => {
  it('is a fully opaque blue', () => {
    expect(DEFAULT_COLOR).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })
})

describe('hexToRgba', () => {
  it('parses a 6-digit hex with #', () => {
    expect(hexToRgba('#3b82f6')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('parses a 6-digit hex without #', () => {
    expect(hexToRgba('3b82f6')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('is case-insensitive', () => {
    expect(hexToRgba('#3B82F6')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('expands 3-digit shorthand', () => {
    expect(hexToRgba('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 })
  })

  it('expands 4-digit shorthand with alpha', () => {
    const result = hexToRgba('#abcd')
    expect(result?.r).toBe(170)
    expect(result?.g).toBe(187)
    expect(result?.b).toBe(204)
    expect(result?.a).toBeCloseTo(221 / 255, 5)
  })

  it('parses 8-digit hex with alpha', () => {
    const result = hexToRgba('#3b82f680')
    expect(result?.r).toBe(59)
    expect(result?.g).toBe(130)
    expect(result?.b).toBe(246)
    expect(result?.a).toBeCloseTo(128 / 255, 5)
  })

  it('returns null for an invalid length (5 digits)', () => {
    expect(hexToRgba('#abcde')).toBeNull()
  })

  it('returns null for an invalid length (7 digits)', () => {
    expect(hexToRgba('#abcdefa')).toBeNull()
  })

  it('returns null for non-hex characters', () => {
    expect(hexToRgba('#gggggg')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(hexToRgba('')).toBeNull()
  })
})

describe('rgbaToHex', () => {
  it('outputs 6-digit hex when alpha is 1', () => {
    expect(rgbaToHex({ r: 59, g: 130, b: 246, a: 1 })).toBe('#3b82f6')
  })

  it('outputs 8-digit hex when alpha is less than 1', () => {
    expect(rgbaToHex({ r: 170, g: 187, b: 204, a: 221 / 255 })).toBe('#aabbccdd')
  })

  it('round-trips black', () => {
    expect(rgbaToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000')
  })

  it('round-trips white', () => {
    expect(rgbaToHex({ r: 255, g: 255, b: 255, a: 1 })).toBe('#ffffff')
  })
})

describe('rgbToHsl', () => {
  it('converts black', () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('converts white', () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts pure red', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('converts pure green', () => {
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 })
  })

  it('converts pure blue', () => {
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 })
  })

  it('converts a gray to s=0', () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 })
  })
})

describe('hslToRgb', () => {
  it('converts black', () => {
    expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts white', () => {
    expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('converts pure red', () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts pure green', () => {
    expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('converts pure blue', () => {
    expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('converts a 0-saturation hue to gray', () => {
    expect(hslToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 })
  })

  it('treats H=360 the same as H=0', () => {
    expect(hslToRgb(360, 100, 50)).toEqual(hslToRgb(0, 100, 50))
  })
})

describe('rgbaToHsla / hslaToRgba', () => {
  it('carries alpha through rgbaToHsla', () => {
    expect(rgbaToHsla({ r: 255, g: 0, b: 0, a: 0.5 })).toEqual({ h: 0, s: 100, l: 50, a: 0.5 })
  })

  it('carries alpha through hslaToRgba', () => {
    expect(hslaToRgba({ h: 0, s: 100, l: 50, a: 0.5 })).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })
  })
})

describe('parseHexInput', () => {
  it('accepts a valid hex value', () => {
    const result = parseHexInput('#3b82f6')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('rejects an invalid hex value', () => {
    const result = parseHexInput('not-a-color')
    expect(result).toEqual({ ok: false, error: 'INVALID_HEX' })
  })
})

describe('parseRgbInput', () => {
  it('accepts valid values', () => {
    const result = parseRgbInput({ r: '59', g: '130', b: '246', a: '100' })
    expect(result).toEqual({ ok: true, value: { r: 59, g: 130, b: 246, a: 1 } })
  })

  it('accepts a fractional alpha percent', () => {
    const result = parseRgbInput({ r: '0', g: '0', b: '0', a: '50' })
    expect(result).toEqual({ ok: true, value: { r: 0, g: 0, b: 0, a: 0.5 } })
  })

  it('rejects R above 255', () => {
    const result = parseRgbInput({ r: '300', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects a negative value', () => {
    const result = parseRgbInput({ r: '-5', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects a non-integer R/G/B value', () => {
    const result = parseRgbInput({ r: '25.5', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects an empty field', () => {
    const result = parseRgbInput({ r: '', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects alpha above 100', () => {
    const result = parseRgbInput({ r: '0', g: '0', b: '0', a: '101' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })
})

describe('parseHslInput', () => {
  it('accepts valid values and converts to RGBA', () => {
    const result = parseHslInput({ h: '0', s: '100', l: '50', a: '100' })
    expect(result).toEqual({ ok: true, value: { r: 255, g: 0, b: 0, a: 1 } })
  })

  it('accepts H=360 as the boundary', () => {
    const result = parseHslInput({ h: '360', s: '100', l: '50', a: '100' })
    expect(result.ok).toBe(true)
  })

  it('rejects H above 360', () => {
    const result = parseHslInput({ h: '361', s: '100', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })

  it('rejects S above 100', () => {
    const result = parseHslInput({ h: '0', s: '101', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })

  it('rejects a non-numeric field', () => {
    const result = parseHslInput({ h: 'abc', s: '100', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })

  it('rejects an empty field', () => {
    const result = parseHslInput({ h: '0', s: '', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })
})

describe('formatRgbaString', () => {
  it('formats an opaque color', () => {
    expect(formatRgbaString({ r: 59, g: 130, b: 246, a: 1 })).toBe('rgba(59, 130, 246, 1)')
  })

  it('formats a half-transparent color without floating point noise', () => {
    expect(formatRgbaString({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('rgba(0, 0, 0, 0.5)')
  })

  it('formats a fully transparent color', () => {
    expect(formatRgbaString({ r: 0, g: 0, b: 0, a: 0 })).toBe('rgba(0, 0, 0, 0)')
  })
})

describe('formatHslaString', () => {
  it('formats an opaque red', () => {
    expect(formatHslaString({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsla(0, 100%, 50%, 1)')
  })

  it('formats a half-transparent color', () => {
    expect(formatHslaString({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('hsla(0, 100%, 50%, 0.5)')
  })
})

describe('round trip: HEX -> RGBA -> HSLA -> RGBA', () => {
  it('stays within rounding tolerance for an arbitrary color', () => {
    // HSL fields are rounded to whole degrees/percent for display, so a round trip
    // through HSL can drift by a channel or two — this is expected, not a bug.
    const original = hexToRgba('#3b82f6')
    expect(original).not.toBeNull()
    if (!original) return
    const hsla = rgbaToHsla(original)
    const backToRgba = hslaToRgba(hsla)
    expect(Math.abs(backToRgba.r - original.r)).toBeLessThanOrEqual(2)
    expect(Math.abs(backToRgba.g - original.g)).toBeLessThanOrEqual(2)
    expect(Math.abs(backToRgba.b - original.b)).toBeLessThanOrEqual(2)
  })

  it('is exact for pure hues with no rounding loss', () => {
    const original = hexToRgba('#ff0000')
    expect(original).not.toBeNull()
    if (!original) return
    const hsla = rgbaToHsla(original)
    const backToRgba = hslaToRgba(hsla)
    expect(rgbaToHex(backToRgba)).toBe('#ff0000')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail (red)**

```bash
npm run test -- --reporter=verbose src/modules/utilities/color-converter/logic.test.ts
```

Expected: error like `Failed to resolve import "./logic"` or all tests fail. Proceed only when you see failures.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/modules/utilities/color-converter/logic.test.ts
git commit -m "test: add failing unit tests for color-converter logic"
```

---

## Task 3: Logic implementation (green phase)

**Files:**
- Create: `src/modules/utilities/color-converter/logic.ts`

**Interfaces:**
- Produces (consumed by Tasks 4, 6):
  ```typescript
  export type Rgba = { r: number; g: number; b: number; a: number }
  export type Hsla = { h: number; s: number; l: number; a: number }
  export type RgbFieldsInput = { r: string; g: string; b: string; a: string }
  export type HslFieldsInput = { h: string; s: string; l: string; a: string }
  export type FieldErrorCode = 'INVALID_HEX' | 'INVALID_RGB' | 'INVALID_HSL'
  export type ParseResult = { ok: true; value: Rgba } | { ok: false; error: FieldErrorCode }

  export const DEFAULT_COLOR: Rgba

  export function hexToRgba(input: string): Rgba | null
  export function rgbaToHex(rgba: Rgba): string
  export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number }
  export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number }
  export function rgbaToHsla(rgba: Rgba): Hsla
  export function hslaToRgba(hsla: Hsla): Rgba
  export function parseHexInput(input: string): ParseResult
  export function parseRgbInput(input: RgbFieldsInput): ParseResult
  export function parseHslInput(input: HslFieldsInput): ParseResult
  export function formatRgbaString(rgba: Rgba): string
  export function formatHslaString(rgba: Rgba): string
  ```

- [ ] **Step 1: Create `logic.ts`**

```typescript
export type Rgba = { r: number; g: number; b: number; a: number }
export type Hsla = { h: number; s: number; l: number; a: number }
export type RgbFieldsInput = { r: string; g: string; b: string; a: string }
export type HslFieldsInput = { h: string; s: string; l: string; a: string }
export type FieldErrorCode = 'INVALID_HEX' | 'INVALID_RGB' | 'INVALID_HSL'
export type ParseResult = { ok: true; value: Rgba } | { ok: false; error: FieldErrorCode }

export const DEFAULT_COLOR: Rgba = { r: 59, g: 130, b: 246, a: 1 }

/** Parses a HEX string (3/4/6/8 digits, with or without leading '#') into RGBA, or null if invalid. */
export function hexToRgba(input: string): Rgba | null {
  const hex = input.trim().replace(/^#/, '')
  if (hex.length === 0 || !/^[0-9a-fA-F]+$/.test(hex)) return null

  let expanded: string
  if (hex.length === 3) {
    expanded = hex.split('').map((c) => c + c).join('') + 'ff'
  } else if (hex.length === 4) {
    expanded = hex.split('').map((c) => c + c).join('')
  } else if (hex.length === 6) {
    expanded = hex + 'ff'
  } else if (hex.length === 8) {
    expanded = hex
  } else {
    return null
  }

  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)
  const aByte = parseInt(expanded.slice(6, 8), 16)

  return { r, g, b, a: aByte / 255 }
}

/** Formats RGBA as 6-digit hex (alpha 1) or 8-digit hex (alpha < 1). */
export function rgbaToHex(rgba: Rgba): string {
  const toHexByte = (n: number) => n.toString(16).padStart(2, '0')
  const alphaByte = Math.round(rgba.a * 255)
  const base = `#${toHexByte(rgba.r)}${toHexByte(rgba.g)}${toHexByte(rgba.b)}`
  return alphaByte === 255 ? base : `${base}${toHexByte(alphaByte)}`
}

/** Standard RGB -> HSL conversion. h in degrees (0-360), s/l in percent (0-100), all rounded. */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case rNorm:
      h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
      break
    case gNorm:
      h = (bNorm - rNorm) / d + 2
      break
    default:
      h = (rNorm - gNorm) / d + 4
  }
  h *= 60

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t
  if (tt < 0) tt += 1
  if (tt > 1) tt -= 1
  if (tt < 1 / 6) return p + (q - p) * 6 * tt
  if (tt < 1 / 2) return q
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
  return p
}

/** Standard HSL -> RGB conversion via hue-sector helper. h in degrees, s/l in percent (0-100). */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hNorm = (((h % 360) + 360) % 360) / 360
  const sNorm = s / 100
  const lNorm = l / 100

  if (sNorm === 0) {
    const gray = Math.round(lNorm * 255)
    return { r: gray, g: gray, b: gray }
  }

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
  const p = 2 * lNorm - q

  const r = hueToRgb(p, q, hNorm + 1 / 3)
  const g = hueToRgb(p, q, hNorm)
  const b = hueToRgb(p, q, hNorm - 1 / 3)

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export function rgbaToHsla(rgba: Rgba): Hsla {
  const { h, s, l } = rgbToHsl(rgba.r, rgba.g, rgba.b)
  return { h, s, l, a: rgba.a }
}

export function hslaToRgba(hsla: Hsla): Rgba {
  const { r, g, b } = hslToRgb(hsla.h, hsla.s, hsla.l)
  return { r, g, b, a: hsla.a }
}

export function parseHexInput(input: string): ParseResult {
  const rgba = hexToRgba(input)
  if (!rgba) return { ok: false, error: 'INVALID_HEX' }
  return { ok: true, value: rgba }
}

function parseIntStrict(value: string): number | null {
  if (!/^-?\d+$/.test(value.trim())) return null
  return parseInt(value, 10)
}

function parseNumStrict(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '' || Number.isNaN(Number(trimmed))) return null
  return Number(trimmed)
}

export function parseRgbInput(input: RgbFieldsInput): ParseResult {
  const r = parseIntStrict(input.r)
  const g = parseIntStrict(input.g)
  const b = parseIntStrict(input.b)
  const aPercent = parseNumStrict(input.a)

  if (
    r === null || g === null || b === null || aPercent === null ||
    r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 ||
    aPercent < 0 || aPercent > 100
  ) {
    return { ok: false, error: 'INVALID_RGB' }
  }

  return { ok: true, value: { r, g, b, a: aPercent / 100 } }
}

export function parseHslInput(input: HslFieldsInput): ParseResult {
  const h = parseNumStrict(input.h)
  const s = parseNumStrict(input.s)
  const l = parseNumStrict(input.l)
  const aPercent = parseNumStrict(input.a)

  if (
    h === null || s === null || l === null || aPercent === null ||
    h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100 ||
    aPercent < 0 || aPercent > 100
  ) {
    return { ok: false, error: 'INVALID_HSL' }
  }

  const { r, g, b } = hslToRgb(h, s, l)
  return { ok: true, value: { r, g, b, a: aPercent / 100 } }
}

function formatAlpha(a: number): string {
  return Number(a.toFixed(2)).toString()
}

export function formatRgbaString(rgba: Rgba): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${formatAlpha(rgba.a)})`
}

export function formatHslaString(rgba: Rgba): string {
  const hsla = rgbaToHsla(rgba)
  return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${formatAlpha(hsla.a)})`
}
```

- [ ] **Step 2: Run tests — verify all pass (green)**

```bash
npm run test -- --reporter=verbose src/modules/utilities/color-converter/logic.test.ts
```

Expected: all tests PASS. If any fail, fix `logic.ts` before proceeding — do not weaken the tests.

- [ ] **Step 3: Commit**

```bash
git add src/modules/utilities/color-converter/logic.ts
git commit -m "feat: implement color-converter conversion and validation logic"
```

---

## Task 4: User-facing strings

**Files:**
- Create: `src/modules/utilities/color-converter/messages.ts`

**Interfaces:**
- Consumes: `FieldErrorCode` from `./logic`
- Produces (consumed by Task 6):
  ```typescript
  export const ERROR_MESSAGES: Record<FieldErrorCode, string>
  export const UI: { hexLabel, rgbLabel, hslLabel, hexPlaceholder, copyHexLabel, copyRgbLabel, copyHslLabel }
  export const ARIA: { swatch, hexInput, rgbR, rgbG, rgbB, rgbAlpha, hslHue, hslSaturation, hslLightness, hslAlpha }
  ```

- [ ] **Step 1: Create `messages.ts`**

```typescript
import type { FieldErrorCode } from './logic'

export const ERROR_MESSAGES: Record<FieldErrorCode, string> = {
  INVALID_HEX: 'Enter a valid hex color, e.g. #3b82f6 or #3b82f6cc.',
  INVALID_RGB: 'R, G, B must be whole numbers 0–255, and A must be 0–100%.',
  INVALID_HSL: 'H must be 0–360, and S, L, A must be 0–100%.',
}

export const UI = {
  hexLabel: 'HEX',
  rgbLabel: 'RGB',
  hslLabel: 'HSL',
  hexPlaceholder: '#3b82f6',
  copyHexLabel: 'Copy hex value',
  copyRgbLabel: 'Copy RGB value',
  copyHslLabel: 'Copy HSL value',
}

export const ARIA = {
  swatch: 'Live color preview',
  hexInput: 'Hex color value',
  rgbR: 'Red (0-255)',
  rgbG: 'Green (0-255)',
  rgbB: 'Blue (0-255)',
  rgbAlpha: 'RGB alpha percent (0-100)',
  hslHue: 'Hue (0-360)',
  hslSaturation: 'Saturation percent (0-100)',
  hslLightness: 'Lightness percent (0-100)',
  hslAlpha: 'HSL alpha percent (0-100)',
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/utilities/color-converter/messages.ts
git commit -m "feat: add color-converter messages"
```

---

## Task 5: Extend shared CopyButton with an optional label

The color converter needs three copy buttons on one page (HEX, RGB, HSL). The existing `CopyButton` hardcodes `aria-label` to `'Copy'`/`'Copied!'`, which would give all three buttons the same accessible name. Add an optional `label` prop, defaulting to `'Copy'` so the existing `base64-converter` usage is unaffected.

**Files:**
- Modify: `src/components/copy-button.tsx`

**Interfaces:**
- Produces: `CopyButton` now accepts an optional `label?: string` prop (consumed by Task 6)

- [ ] **Step 1: Update `CopyButtonProps` and the component**

In `src/components/copy-button.tsx`, change:

```typescript
interface CopyButtonProps {
  value: string
  className?: string
}

export function CopyButton({ value, className }: CopyButtonProps) {
```

to:

```typescript
interface CopyButtonProps {
  value: string
  className?: string
  label?: string
}

export function CopyButton({ value, className, label = 'Copy' }: CopyButtonProps) {
```

And change the button's `aria-label`:

```typescript
      aria-label={copied ? 'Copied!' : 'Copy'}
```

to:

```typescript
      aria-label={copied ? 'Copied!' : label}
```

- [ ] **Step 2: Run existing tests to confirm no regression**

```bash
npm run typecheck && npm run test
```

Expected: no errors, all existing tests still pass (base64-converter's `CopyButton` usage keeps its default `'Copy'` label).

- [ ] **Step 3: Commit**

```bash
git add src/components/copy-button.tsx
git commit -m "refactor: add optional label prop to CopyButton"
```

---

## Task 6: React UI component

**Files:**
- Create: `src/modules/utilities/color-converter/index.tsx`

**Interfaces:**
- Consumes:
  - `DEFAULT_COLOR`, `Rgba`, `RgbFieldsInput`, `HslFieldsInput`, `parseHexInput`, `parseRgbInput`, `parseHslInput`, `rgbaToHex`, `rgbaToHsla`, `formatRgbaString`, `formatHslaString` from `./logic`
  - `ERROR_MESSAGES`, `UI`, `ARIA` from `./messages`
  - `Input` from `@/components/ui/input`
  - `Label` from `@/components/ui/label`
  - `CopyButton` from `@/components/copy-button` (with the `label` prop added in Task 5)
- Produces: default export `ColorConverter` component (consumed by Task 7 componentMap)

- [ ] **Step 1: Create `index.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/copy-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DEFAULT_COLOR,
  formatHslaString,
  formatRgbaString,
  parseHexInput,
  parseHslInput,
  parseRgbInput,
  rgbaToHex,
  rgbaToHsla,
  type HslFieldsInput,
  type Rgba,
  type RgbFieldsInput,
} from './logic'
import { ARIA, ERROR_MESSAGES, UI } from './messages'

function toRgbFields(color: Rgba): RgbFieldsInput {
  return {
    r: String(color.r),
    g: String(color.g),
    b: String(color.b),
    a: String(Math.round(color.a * 100)),
  }
}

function toHslFields(color: Rgba): HslFieldsInput {
  const hsla = rgbaToHsla(color)
  return {
    h: String(hsla.h),
    s: String(hsla.s),
    l: String(hsla.l),
    a: String(Math.round(color.a * 100)),
  }
}

const CHECKERBOARD =
  'bg-[length:16px_16px] bg-[position:0_0,8px_8px] ' +
  'bg-[image:linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)]'

export default function ColorConverter() {
  const [color, setColor] = useState<Rgba>(DEFAULT_COLOR)
  const [hexInput, setHexInput] = useState(rgbaToHex(DEFAULT_COLOR))
  const [hexError, setHexError] = useState(false)
  const [rgbFields, setRgbFields] = useState<RgbFieldsInput>(toRgbFields(DEFAULT_COLOR))
  const [rgbError, setRgbError] = useState(false)
  const [hslFields, setHslFields] = useState<HslFieldsInput>(toHslFields(DEFAULT_COLOR))
  const [hslError, setHslError] = useState(false)

  function handleHexChange(value: string) {
    setHexInput(value)
    const result = parseHexInput(value)
    if (result.ok) {
      setColor(result.value)
      setHexError(false)
      setRgbFields(toRgbFields(result.value))
      setRgbError(false)
      setHslFields(toHslFields(result.value))
      setHslError(false)
    } else {
      setHexError(true)
    }
  }

  function handleRgbFieldChange(field: keyof RgbFieldsInput, value: string) {
    const next = { ...rgbFields, [field]: value }
    setRgbFields(next)
    const result = parseRgbInput(next)
    if (result.ok) {
      setColor(result.value)
      setRgbError(false)
      setHexInput(rgbaToHex(result.value))
      setHexError(false)
      setHslFields(toHslFields(result.value))
      setHslError(false)
    } else {
      setRgbError(true)
    }
  }

  function handleHslFieldChange(field: keyof HslFieldsInput, value: string) {
    const next = { ...hslFields, [field]: value }
    setHslFields(next)
    const result = parseHslInput(next)
    if (result.ok) {
      setColor(result.value)
      setHslError(false)
      setHexInput(rgbaToHex(result.value))
      setHexError(false)
      setRgbFields(toRgbFields(result.value))
      setRgbError(false)
    } else {
      setHslError(true)
    }
  }

  const rgbaString = formatRgbaString(color)
  const hslaString = formatHslaString(color)

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div className={`relative h-24 w-full overflow-hidden rounded-lg border border-border ${CHECKERBOARD}`}>
        <div
          className="absolute inset-0"
          role="img"
          aria-label={ARIA.swatch}
          style={{ backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hex-input">{UI.hexLabel}</Label>
        <div className="flex gap-2">
          <Input
            id="hex-input"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder={UI.hexPlaceholder}
            aria-label={ARIA.hexInput}
            className="flex-1 min-w-0 font-mono"
            spellCheck={false}
          />
          <CopyButton value={hexInput} label={UI.copyHexLabel} className="shrink-0" />
        </div>
        {hexError && (
          <p className="text-sm text-destructive" role="alert">
            {ERROR_MESSAGES.INVALID_HEX}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{UI.rgbLabel}</Label>
        <div className="grid grid-cols-4 gap-2">
          <Input
            type="number"
            value={rgbFields.r}
            onChange={(e) => handleRgbFieldChange('r', e.target.value)}
            aria-label={ARIA.rgbR}
            className="min-w-0"
          />
          <Input
            type="number"
            value={rgbFields.g}
            onChange={(e) => handleRgbFieldChange('g', e.target.value)}
            aria-label={ARIA.rgbG}
            className="min-w-0"
          />
          <Input
            type="number"
            value={rgbFields.b}
            onChange={(e) => handleRgbFieldChange('b', e.target.value)}
            aria-label={ARIA.rgbB}
            className="min-w-0"
          />
          <Input
            type="number"
            value={rgbFields.a}
            onChange={(e) => handleRgbFieldChange('a', e.target.value)}
            aria-label={ARIA.rgbAlpha}
            className="min-w-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate text-sm text-muted-foreground">{rgbaString}</code>
          <CopyButton value={rgbaString} label={UI.copyRgbLabel} className="shrink-0" />
        </div>
        {rgbError && (
          <p className="text-sm text-destructive" role="alert">
            {ERROR_MESSAGES.INVALID_RGB}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{UI.hslLabel}</Label>
        <div className="grid grid-cols-4 gap-2">
          <Input
            type="number"
            value={hslFields.h}
            onChange={(e) => handleHslFieldChange('h', e.target.value)}
            aria-label={ARIA.hslHue}
            className="min-w-0"
          />
          <Input
            type="number"
            value={hslFields.s}
            onChange={(e) => handleHslFieldChange('s', e.target.value)}
            aria-label={ARIA.hslSaturation}
            className="min-w-0"
          />
          <Input
            type="number"
            value={hslFields.l}
            onChange={(e) => handleHslFieldChange('l', e.target.value)}
            aria-label={ARIA.hslLightness}
            className="min-w-0"
          />
          <Input
            type="number"
            value={hslFields.a}
            onChange={(e) => handleHslFieldChange('a', e.target.value)}
            aria-label={ARIA.hslAlpha}
            className="min-w-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate text-sm text-muted-foreground">{hslaString}</code>
          <CopyButton value={hslaString} label={UI.copyHslLabel} className="shrink-0" />
        </div>
        {hslError && (
          <p className="text-sm text-destructive" role="alert">
            {ERROR_MESSAGES.INVALID_HSL}
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors. If errors appear, fix them before committing.

- [ ] **Step 3: Commit**

```bash
git add src/modules/utilities/color-converter/index.tsx
git commit -m "feat: add color-converter UI component"
```

---

## Task 7: Registration

**Files:**
- Modify: `src/lib/registry.ts`
- Modify: `src/components/utilities-module-content.tsx`

**Interfaces:**
- Consumes: `colorConverterMeta` from Task 1; default export from Task 6

- [ ] **Step 1: Update `src/lib/registry.ts`**

Add the import after the existing utility imports:

```typescript
import { colorConverterMeta } from '@/modules/utilities/color-converter/meta'
```

Add `colorConverterMeta` to the `registry` array (after `passwordStrengthCheckerMeta`, before the games entries):

```typescript
export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, passwordStrengthCheckerMeta, colorConverterMeta, memoryCardMeta, typingSpeedTestMeta, reactionTimeTestMeta, snakeMeta]
```

- [ ] **Step 2: Update `src/components/utilities-module-content.tsx`**

Add the dynamic import inside `componentMap`:

```typescript
const componentMap = {
  'unit-converter': dynamic(() => import('@/modules/utilities/unit-converter'), { loading: ModuleSkeleton, ssr: false }),
  'base64-converter': dynamic(() => import('@/modules/utilities/base64-converter'), { loading: ModuleSkeleton, ssr: false }),
  'password-strength-checker': dynamic(() => import('@/modules/utilities/password-strength-checker'), { loading: ModuleSkeleton, ssr: false }),
  'color-converter': dynamic(() => import('@/modules/utilities/color-converter'), { loading: ModuleSkeleton, ssr: false }),
}
```

- [ ] **Step 3: Run full check**

```bash
npm run typecheck && npm run test
```

Expected: typecheck passes, all unit tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/registry.ts src/components/utilities-module-content.tsx
git commit -m "feat: register color-converter in registry and componentMap"
```

---

## Task 8: E2E test

**Files:**
- Create: `tests/e2e/color-converter.spec.ts`

**Interfaces:**
- Consumes: running dev server at `/utilities/color-converter`

- [ ] **Step 1: Create the E2E test**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Color Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/color-converter')
  })

  test('loads with the default color populated in all three formats', async ({ page }) => {
    await expect(page.getByLabel('Hex color value')).toHaveValue('#3b82f6')
    await expect(page.getByLabel('Red (0-255)')).toHaveValue('59')
    await expect(page.getByLabel('Green (0-255)')).toHaveValue('130')
    await expect(page.getByLabel('Blue (0-255)')).toHaveValue('246')
    await expect(page.getByLabel('Hue (0-360)')).toHaveValue('217')
    await expect(page.getByRole('img', { name: 'Live color preview' })).toHaveCSS(
      'background-color',
      'rgb(59, 130, 246)'
    )
    await page.screenshot({ path: 'test-results/color-converter-idle.png' })
  })

  test('editing the HEX field updates RGB and HSL', async ({ page }) => {
    await page.getByLabel('Hex color value').fill('#ff0000')
    await expect(page.getByLabel('Red (0-255)')).toHaveValue('255')
    await expect(page.getByLabel('Green (0-255)')).toHaveValue('0')
    await expect(page.getByLabel('Blue (0-255)')).toHaveValue('0')
    await expect(page.getByLabel('Hue (0-360)')).toHaveValue('0')
    await expect(page.getByLabel('Saturation percent (0-100)')).toHaveValue('100')
    await expect(page.getByLabel('Lightness percent (0-100)')).toHaveValue('50')
    await expect(page.getByRole('img', { name: 'Live color preview' })).toHaveCSS(
      'background-color',
      'rgb(255, 0, 0)'
    )
  })

  test('editing an RGB field updates HEX and HSL', async ({ page }) => {
    await page.getByLabel('Red (0-255)').fill('0')
    await expect(page.getByLabel('Hex color value')).toHaveValue('#0082f6')
    await expect(page.getByLabel('Hue (0-360)')).toHaveValue('208')
  })

  test('invalid HEX input shows an inline error without clearing the swatch', async ({ page }) => {
    await page.getByLabel('Hex color value').fill('not-a-color')
    await expect(page.getByText('Enter a valid hex color', { exact: false })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Live color preview' })).toHaveCSS(
      'background-color',
      'rgb(59, 130, 246)'
    )
  })

  test('copy buttons are present for all three formats', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Copy hex value' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy RGB value' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy HSL value' })).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the E2E test**

```bash
npm run test:e2e -- color-converter.spec.ts
```

Expected: all 5 tests pass. Review `test-results/color-converter-idle.png` to confirm the module looks correct (swatch, HEX/RGB/HSL sections, copy buttons all visible and readable on a mobile-width viewport).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/color-converter.spec.ts
git commit -m "test: add E2E tests for color-converter"
```

---

## Task 9: Documentation

**Files:**
- Modify: `README.md` (add module to utilities table)

- [ ] **Step 1: Add a row to the utilities table in `README.md`**

Find the utilities module table and add a new row after the last existing utility entry, matching the exact column format used by existing rows:

```text
| [Color Converter](https://miniyard.netlify.app/utilities/color-converter) | Convert colors between HEX, RGB, and HSL with alpha support and a live preview swatch | `color-converter` |
```

- [ ] **Step 2: Run markdown lint**

```bash
npm run lint:md
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add color-converter to README"
```

---

## Task 10: Final verification

- [ ] **Step 1: Run all unit tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Run E2E tests**

```bash
npm run test:e2e
```

Expected: all E2E tests pass (including the pre-existing suite — confirm no regressions), screenshot saved to `test-results/color-converter-idle.png`.

- [ ] **Step 5: Push branch**

```bash
git push -u origin claude/new-session-mlu5l1
```
