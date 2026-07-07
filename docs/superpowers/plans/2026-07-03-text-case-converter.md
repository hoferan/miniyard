# Text Case Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a utilities module that converts arbitrary text into 9 casing styles (UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE) live as the user types, with a copy button per row.

**Architecture:** Pure-function tokeniser + 9 formatter functions in `logic.ts`, aggregated by a single `convertAllCases(input)` entry point. `index.tsx` is a thin client component holding one `input` state value, calling `convertAllCases` on every render, and mapping the result over 9 read-only `Input` rows with the existing shared `CopyButton`.

**Tech Stack:** Next.js 14 App Router, React, TypeScript strict mode, Tailwind, shadcn/ui (`Textarea`, `Input`, `Label`), Vitest, Playwright.

## Global Constraints

- Category: `utilities` (`src/modules/utilities/text-case-converter/`)
- No `messages.ts` — no error/status copy in this module, only static row labels
- `logic.ts` must stay pure — no React, no DOM, no side effects
- TypeScript strict mode, no `any`
- No inline styles — Tailwind utility classes only
- Reuse the existing `CopyButton` component (`src/components/copy-button.tsx`) — do not build a new copy mechanism
- Every edge case in the spec must have a corresponding unit test
- Spec reference: `docs/superpowers/specs/2026-07-03-text-case-converter-design.md`

**Implementation refinement over the spec (found during planning, applied here):** the spec's Logic/Algorithm section says UPPER CASE / lower case / Sentence case "operate on the raw input string." To satisfy the spec's own Edge Case row ("Whitespace-only input → all 9 outputs are `''`"), those three formats must operate on `input.trim()`, not the untrimmed raw string — otherwise a whitespace-only input like `'   '` would produce `'   '` for those three formats instead of `''`. Word-tokenised formats are unaffected (`tokenise` already ignores whitespace). This plan implements the trimmed version; Task 8 updates the spec doc to match.

---

## Task 1: Module metadata and icon

**Files:**
- Create: `src/modules/utilities/text-case-converter/meta.ts`
- Modify: `src/lib/icons.ts`

**Interfaces:**
- Consumes: `Module` type from `src/lib/types.ts` (`{ slug, title, description, category, tags, createdAt, icon? }`)
- Produces: `textCaseConverterMeta: Module` — consumed by Task 5 (`registry.ts`)

- [ ] **Step 1: Add the `CaseSensitive` icon to the icon map**

Edit `src/lib/icons.ts`:

```ts
import { Ruler, Code2, ShieldCheck, LayoutGrid, Keyboard, Zap, Worm, Pipette, CaseSensitive } from 'lucide-react'
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
  'case-sensitive': CaseSensitive,
}
```

- [ ] **Step 2: Create `meta.ts`**

```ts
import { Module } from '@/lib/types'

export const textCaseConverterMeta: Module = {
  slug: 'text-case-converter',
  title: 'Text Case Converter',
  description: 'Convert text between UPPER CASE, camelCase, snake_case, and more — all at once.',
  category: 'utilities',
  tags: ['text', 'case', 'converter', 'developer'],
  createdAt: '2026-07-03',
  icon: 'case-sensitive',
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/modules/utilities/text-case-converter/meta.ts src/lib/icons.ts
git commit -m "feat: add Text Case Converter module metadata and icon"
```

---

## Task 2: Failing unit tests for `logic.ts`

**Files:**
- Create: `src/modules/utilities/text-case-converter/logic.test.ts`

**Interfaces:**
- Consumes: nothing yet (imports from `./logic`, which does not exist until Task 3)
- Produces: the test suite Task 3's `logic.ts` must satisfy. Exact exports the tests import: `tokenise`, `toUpperCase`, `toLowerCase`, `toSentenceCase`, `toTitleCase`, `toCamelCase`, `toPascalCase`, `toSnakeCase`, `toKebabCase`, `toScreamingSnakeCase`, `convertAllCases`, and the type `CaseConversions`.

- [ ] **Step 1: Write the full failing test file**

```ts
import { describe, it, expect } from 'vitest'
import {
  tokenise,
  toUpperCase,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toScreamingSnakeCase,
  convertAllCases,
} from './logic'

describe('tokenise', () => {
  it('splits whitespace-separated words', () => {
    expect(tokenise('hello world example')).toEqual(['hello', 'world', 'example'])
  })

  it('splits punctuation-separated words', () => {
    expect(tokenise('hello, world! example.')).toEqual(['hello', 'world', 'example'])
  })

  it('splits camelCase boundaries', () => {
    expect(tokenise('helloWorldExample')).toEqual(['hello', 'World', 'Example'])
  })

  it('splits PascalCase boundaries', () => {
    expect(tokenise('HelloWorldExample')).toEqual(['Hello', 'World', 'Example'])
  })

  it('keeps a standalone acronym as one word', () => {
    expect(tokenise('HTML')).toEqual(['HTML'])
  })

  it('splits an acronym run followed by a capitalised word', () => {
    expect(tokenise('parseHTMLString')).toEqual(['parse', 'HTML', 'String'])
  })

  it('splits a leading acronym run', () => {
    expect(tokenise('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request'])
  })

  it('keeps digits attached to the preceding letters', () => {
    expect(tokenise('version2Update')).toEqual(['version2', 'Update'])
    expect(tokenise('item99Name')).toEqual(['item99', 'Name'])
  })

  it('treats a digits-only chunk as one word', () => {
    expect(tokenise('123')).toEqual(['123'])
  })

  it('returns an empty array for an empty string', () => {
    expect(tokenise('')).toEqual([])
  })

  it('returns an empty array for a whitespace-only string', () => {
    expect(tokenise('   ')).toEqual([])
  })

  it('splits on mixed separators consistently', () => {
    expect(tokenise('foo_bar-baz qux')).toEqual(['foo', 'bar', 'baz', 'qux'])
  })

  it('strips leading and trailing separators without producing empty words', () => {
    expect(tokenise('  -_foo bar_-  ')).toEqual(['foo', 'bar'])
  })

  it('treats non-ASCII letters as ordinary letters, not boundaries', () => {
    expect(tokenise('café bar')).toEqual(['café', 'bar'])
  })
})

describe('toUpperCase', () => {
  it('uppercases the whole string', () => {
    expect(toUpperCase('Hello World')).toBe('HELLO WORLD')
  })

  it('returns an empty string for empty input', () => {
    expect(toUpperCase('')).toBe('')
  })
})

describe('toLowerCase', () => {
  it('lowercases the whole string', () => {
    expect(toLowerCase('Hello World')).toBe('hello world')
  })

  it('returns an empty string for empty input', () => {
    expect(toLowerCase('')).toBe('')
  })
})

describe('toSentenceCase', () => {
  it('capitalises only the first letter of a lowercase sentence', () => {
    expect(toSentenceCase('hello world example')).toBe('Hello world example')
  })

  it('lowercases everything else regardless of original casing', () => {
    expect(toSentenceCase('HELLO WORLD')).toBe('Hello world')
  })

  it('returns an empty string for empty input', () => {
    expect(toSentenceCase('')).toBe('')
  })

  it('leaves a string with no letters unchanged', () => {
    expect(toSentenceCase('123 456')).toBe('123 456')
  })
})

describe('toTitleCase', () => {
  it('capitalises each word', () => {
    expect(toTitleCase(['hello', 'World', 'EXAMPLE'])).toBe('Hello World Example')
  })

  it('handles a single word', () => {
    expect(toTitleCase(['hello'])).toBe('Hello')
  })

  it('returns an empty string for no words', () => {
    expect(toTitleCase([])).toBe('')
  })
})

describe('toCamelCase', () => {
  it('lowercases the first word and capitalises the rest', () => {
    expect(toCamelCase(['hello', 'World', 'EXAMPLE'])).toBe('helloWorldExample')
  })

  it('handles a single word', () => {
    expect(toCamelCase(['Hello'])).toBe('hello')
  })

  it('returns an empty string for no words', () => {
    expect(toCamelCase([])).toBe('')
  })
})

describe('toPascalCase', () => {
  it('capitalises every word with no separator', () => {
    expect(toPascalCase(['hello', 'World', 'EXAMPLE'])).toBe('HelloWorldExample')
  })

  it('handles a single word', () => {
    expect(toPascalCase(['hello'])).toBe('Hello')
  })

  it('returns an empty string for no words', () => {
    expect(toPascalCase([])).toBe('')
  })
})

describe('toSnakeCase', () => {
  it('lowercases and joins with underscores', () => {
    expect(toSnakeCase(['Hello', 'World', 'EXAMPLE'])).toBe('hello_world_example')
  })

  it('handles a single word', () => {
    expect(toSnakeCase(['Hello'])).toBe('hello')
  })

  it('returns an empty string for no words', () => {
    expect(toSnakeCase([])).toBe('')
  })
})

describe('toKebabCase', () => {
  it('lowercases and joins with hyphens', () => {
    expect(toKebabCase(['Hello', 'World', 'EXAMPLE'])).toBe('hello-world-example')
  })

  it('handles a single word', () => {
    expect(toKebabCase(['Hello'])).toBe('hello')
  })

  it('returns an empty string for no words', () => {
    expect(toKebabCase([])).toBe('')
  })
})

describe('toScreamingSnakeCase', () => {
  it('uppercases and joins with underscores', () => {
    expect(toScreamingSnakeCase(['Hello', 'World', 'EXAMPLE'])).toBe('HELLO_WORLD_EXAMPLE')
  })

  it('handles a single word', () => {
    expect(toScreamingSnakeCase(['hello'])).toBe('HELLO')
  })

  it('returns an empty string for no words', () => {
    expect(toScreamingSnakeCase([])).toBe('')
  })
})

describe('convertAllCases', () => {
  it('computes all 9 formats for a representative mixed-case input', () => {
    expect(convertAllCases('Hello World Example')).toEqual({
      upperCase: 'HELLO WORLD EXAMPLE',
      lowerCase: 'hello world example',
      titleCase: 'Hello World Example',
      sentenceCase: 'Hello world example',
      camelCase: 'helloWorldExample',
      pascalCase: 'HelloWorldExample',
      snakeCase: 'hello_world_example',
      kebabCase: 'hello-world-example',
      screamingSnakeCase: 'HELLO_WORLD_EXAMPLE',
    })
  })

  it('computes all 9 formats for an already-cased identifier', () => {
    expect(convertAllCases('parseHTMLString')).toEqual({
      upperCase: 'PARSEHTMLSTRING',
      lowerCase: 'parsehtmlstring',
      titleCase: 'Parse Html String',
      sentenceCase: 'Parsehtmlstring',
      camelCase: 'parseHtmlString',
      pascalCase: 'ParseHtmlString',
      snakeCase: 'parse_html_string',
      kebabCase: 'parse-html-string',
      screamingSnakeCase: 'PARSE_HTML_STRING',
    })
  })

  it('returns all empty strings for empty input', () => {
    expect(convertAllCases('')).toEqual({
      upperCase: '',
      lowerCase: '',
      titleCase: '',
      sentenceCase: '',
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      kebabCase: '',
      screamingSnakeCase: '',
    })
  })

  it('returns all empty strings for whitespace-only input', () => {
    expect(convertAllCases('   ')).toEqual({
      upperCase: '',
      lowerCase: '',
      titleCase: '',
      sentenceCase: '',
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      kebabCase: '',
      screamingSnakeCase: '',
    })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/modules/utilities/text-case-converter/logic.test.ts`
Expected: FAIL — `Cannot find module './logic'` (file does not exist yet)

- [ ] **Step 3: Commit the red test**

```bash
git add src/modules/utilities/text-case-converter/logic.test.ts
git commit -m "test: add failing tests for Text Case Converter logic"
```

---

## Task 3: Implement `logic.ts`

**Files:**
- Create: `src/modules/utilities/text-case-converter/logic.ts`

**Interfaces:**
- Consumes: nothing (pure functions, no imports beyond none needed)
- Produces:
  - `tokenise(input: string): string[]`
  - `toUpperCase(input: string): string`
  - `toLowerCase(input: string): string`
  - `toSentenceCase(input: string): string`
  - `toTitleCase(words: string[]): string`
  - `toCamelCase(words: string[]): string`
  - `toPascalCase(words: string[]): string`
  - `toSnakeCase(words: string[]): string`
  - `toKebabCase(words: string[]): string`
  - `toScreamingSnakeCase(words: string[]): string`
  - `type CaseConversions = { upperCase: string; lowerCase: string; titleCase: string; sentenceCase: string; camelCase: string; pascalCase: string; snakeCase: string; kebabCase: string; screamingSnakeCase: string }`
  - `convertAllCases(input: string): CaseConversions` — consumed by Task 4 (`index.tsx`)

- [ ] **Step 1: Write the implementation**

```ts
function capitalise(word: string): string {
  if (word.length === 0) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function tokenise(input: string): string[] {
  const chunks = input.match(/[\p{L}\p{N}]+/gu) ?? []
  const words: string[] = []
  for (const chunk of chunks) {
    const split = chunk
      .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
      .split(' ')
    words.push(...split)
  }
  return words
}

export function toUpperCase(input: string): string {
  return input.toUpperCase()
}

export function toLowerCase(input: string): string {
  return input.toLowerCase()
}

export function toSentenceCase(input: string): string {
  const lower = input.toLowerCase()
  const idx = lower.search(/\p{L}/u)
  if (idx === -1) return lower
  return lower.slice(0, idx) + lower.charAt(idx).toUpperCase() + lower.slice(idx + 1)
}

export function toTitleCase(words: string[]): string {
  return words.map((w) => capitalise(w.toLowerCase())).join(' ')
}

export function toCamelCase(words: string[]): string {
  if (words.length === 0) return ''
  const [first, ...rest] = words
  return first.toLowerCase() + rest.map((w) => capitalise(w.toLowerCase())).join('')
}

export function toPascalCase(words: string[]): string {
  return words.map((w) => capitalise(w.toLowerCase())).join('')
}

export function toSnakeCase(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join('_')
}

export function toKebabCase(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join('-')
}

export function toScreamingSnakeCase(words: string[]): string {
  return words.map((w) => w.toUpperCase()).join('_')
}

export type CaseConversions = {
  upperCase: string
  lowerCase: string
  titleCase: string
  sentenceCase: string
  camelCase: string
  pascalCase: string
  snakeCase: string
  kebabCase: string
  screamingSnakeCase: string
}

export function convertAllCases(input: string): CaseConversions {
  const trimmed = input.trim()
  const words = tokenise(input)
  return {
    upperCase: toUpperCase(trimmed),
    lowerCase: toLowerCase(trimmed),
    titleCase: toTitleCase(words),
    sentenceCase: toSentenceCase(trimmed),
    camelCase: toCamelCase(words),
    pascalCase: toPascalCase(words),
    snakeCase: toSnakeCase(words),
    kebabCase: toKebabCase(words),
    screamingSnakeCase: toScreamingSnakeCase(words),
  }
}
```

- [ ] **Step 2: Run the tests to verify they pass**

Run: `npx vitest run src/modules/utilities/text-case-converter/logic.test.ts`
Expected: PASS — all tests green

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/modules/utilities/text-case-converter/logic.ts
git commit -m "feat: implement Text Case Converter logic"
```

---

## Task 4: `index.tsx` UI component

**Files:**
- Create: `src/modules/utilities/text-case-converter/index.tsx`

**Interfaces:**
- Consumes: `convertAllCases`, `type CaseConversions` from `./logic` (Task 3); `Textarea` from `@/components/ui/textarea`; `Input` from `@/components/ui/input`; `Label` from `@/components/ui/label`; `CopyButton` from `@/components/copy-button`
- Produces: default export `TextCaseConverter` — consumed by Task 5 (`componentMap`)

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyButton } from '@/components/copy-button'
import { convertAllCases, type CaseConversions } from './logic'

const FORMAT_ROWS: { key: keyof CaseConversions; label: string }[] = [
  { key: 'upperCase', label: 'UPPER CASE' },
  { key: 'lowerCase', label: 'lower case' },
  { key: 'titleCase', label: 'Title Case' },
  { key: 'sentenceCase', label: 'Sentence case' },
  { key: 'camelCase', label: 'camelCase' },
  { key: 'pascalCase', label: 'PascalCase' },
  { key: 'snakeCase', label: 'snake_case' },
  { key: 'kebabCase', label: 'kebab-case' },
  { key: 'screamingSnakeCase', label: 'SCREAMING_SNAKE_CASE' },
]

export default function TextCaseConverter() {
  const [input, setInput] = useState('')
  const results = convertAllCases(input)

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div>
        <Label htmlFor="text-case-input" className="mb-1.5 block">
          Text
        </Label>
        <Textarea
          id="text-case-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to convert..."
          rows={4}
          className="resize-y"
        />
      </div>

      <div className="space-y-3">
        {FORMAT_ROWS.map(({ key, label }) => (
          <div key={key}>
            <Label htmlFor={`text-case-output-${key}`} className="mb-1.5 block">
              {label}
            </Label>
            <div className="relative">
              <Input
                id={`text-case-output-${key}`}
                value={results[key]}
                readOnly
                className="pr-11 bg-muted text-muted-foreground font-mono"
              />
              <CopyButton
                value={results[key]}
                label={`Copy ${label} value`}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/utilities/text-case-converter/index.tsx
git commit -m "feat: add Text Case Converter UI component"
```

---

## Task 5: Registration

**Files:**
- Modify: `src/lib/registry.ts`
- Modify: `src/components/utilities-module-content.tsx`

**Interfaces:**
- Consumes: `textCaseConverterMeta` (Task 1), default export of `src/modules/utilities/text-case-converter` (Task 4)
- Produces: module reachable at `/utilities/text-case-converter` and listed on `/utilities`

- [ ] **Step 1: Register in `registry.ts`**

Edit `src/lib/registry.ts` — add the import and append to the `registry` array:

```ts
import { Module, ModuleCategory } from './types'
import { unitConverterMeta } from '@/modules/utilities/unit-converter/meta'
import { base64ConverterMeta } from '@/modules/utilities/base64-converter/meta'
import { passwordStrengthCheckerMeta } from '@/modules/utilities/password-strength-checker/meta'
import { colorConverterMeta } from '@/modules/utilities/color-converter/meta'
import { textCaseConverterMeta } from '@/modules/utilities/text-case-converter/meta'
import { memoryCardMeta } from '@/modules/games/memory-card/meta'
import { typingSpeedTestMeta } from '@/modules/games/typing-speed-test/meta'
import { reactionTimeTestMeta } from '@/modules/games/reaction-time-test/meta'
import { snakeMeta } from '@/modules/games/snake/meta'

export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, passwordStrengthCheckerMeta, colorConverterMeta, textCaseConverterMeta, memoryCardMeta, typingSpeedTestMeta, reactionTimeTestMeta, snakeMeta]

export function getModulesByCategory(category: ModuleCategory) {
  return registry.filter((m) => m.category === category)
}

export function getModuleBySlug(slug: string) {
  return registry.find((m) => m.slug === slug)
}
```

- [ ] **Step 2: Register in `componentMap`**

Edit `src/components/utilities-module-content.tsx`:

```tsx
'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  'unit-converter': dynamic(() => import('@/modules/utilities/unit-converter'), { loading: ModuleSkeleton, ssr: false }),
  'base64-converter': dynamic(() => import('@/modules/utilities/base64-converter'), { loading: ModuleSkeleton, ssr: false }),
  'password-strength-checker': dynamic(() => import('@/modules/utilities/password-strength-checker'), { loading: ModuleSkeleton, ssr: false }),
  'color-converter': dynamic(() => import('@/modules/utilities/color-converter'), { loading: ModuleSkeleton, ssr: false }),
  'text-case-converter': dynamic(() => import('@/modules/utilities/text-case-converter'), { loading: ModuleSkeleton, ssr: false }),
}

export function UtilitiesModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
```

- [ ] **Step 3: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed, `/utilities/text-case-converter` appears in the build output as a static route

- [ ] **Step 4: Commit**

```bash
git add src/lib/registry.ts src/components/utilities-module-content.tsx
git commit -m "feat: register Text Case Converter module"
```

---

## Task 6: E2E test

**Files:**
- Create: `tests/e2e/text-case-converter.spec.ts`

**Interfaces:**
- Consumes: the running app at `/utilities/text-case-converter` (Task 5)
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Write the E2E test**

```ts
import { test, expect } from '@playwright/test'

test.describe('Text Case Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/text-case-converter')
  })

  test('loads with all format rows empty by default', async ({ page }) => {
    await expect(page.getByLabel('UPPER CASE')).toHaveValue('')
    await expect(page.getByLabel('snake_case')).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Copy UPPER CASE value' })).toBeDisabled()
    await page.screenshot({ path: 'test-results/text-case-converter-idle.png' })
  })

  test('typing text updates all 9 format rows', async ({ page }) => {
    await page.getByLabel('Text').fill('Hello World Example')
    await expect(page.getByLabel('UPPER CASE')).toHaveValue('HELLO WORLD EXAMPLE')
    await expect(page.getByLabel('lower case')).toHaveValue('hello world example')
    await expect(page.getByLabel('Title Case')).toHaveValue('Hello World Example')
    await expect(page.getByLabel('Sentence case')).toHaveValue('Hello world example')
    await expect(page.getByLabel('camelCase')).toHaveValue('helloWorldExample')
    await expect(page.getByLabel('PascalCase')).toHaveValue('HelloWorldExample')
    await expect(page.getByLabel('snake_case')).toHaveValue('hello_world_example')
    await expect(page.getByLabel('kebab-case')).toHaveValue('hello-world-example')
    await expect(page.getByLabel('SCREAMING_SNAKE_CASE')).toHaveValue('HELLO_WORLD_EXAMPLE')
  })

  test('copy buttons are present and enabled once there is output', async ({ page }) => {
    await page.getByLabel('Text').fill('Hello World')
    await expect(page.getByRole('button', { name: 'Copy UPPER CASE value' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Copy snake_case value' })).toBeEnabled()
  })
})
```

- [ ] **Step 2: Run the E2E test**

Run: `npm run test:e2e -- text-case-converter`
Expected: all 3 tests pass; `test-results/text-case-converter-idle.png` is created

- [ ] **Step 3: Review the screenshot**

Open `test-results/text-case-converter-idle.png` and confirm the module renders correctly in its default (empty) state on the module page — textarea at top, 9 labeled rows below with visible but disabled copy buttons.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/text-case-converter.spec.ts
git commit -m "test: add E2E test for Text Case Converter"
```

---

## Task 7: Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-07-03-text-case-converter-design.md`

**Interfaces:**
- Consumes: nothing
- Produces: nothing (terminal task besides verification)

- [ ] **Step 1: Add the module to the README utilities table**

Read the current `README.md` utilities module table and add a row for Text Case Converter (slug, title, one-line description), following the exact formatting of the existing rows for `base64-converter` / `color-converter`.

- [ ] **Step 2: Correct the spec doc's Logic/Algorithm and Edge Cases sections**

In `docs/superpowers/specs/2026-07-03-text-case-converter-design.md`, update:
- The `toUpperCase` / `toLowerCase` / `toSentenceCase` lines in the `Logic / Algorithm` section to note they operate on `input.trim()`, not the raw untrimmed string.
- Confirm the `Empty input` / `Whitespace-only input` rows in `Edge Cases` still read "All 9 outputs are `''`" (no change needed there — this is what makes the trim necessary).

- [ ] **Step 3: Run markdown lint**

Run: `npm run lint:md`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add README.md docs/superpowers/specs/2026-07-03-text-case-converter-design.md
git commit -m "docs: document Text Case Converter module"
```

---

## Task 8: Verification

**Files:** none (verification only)

- [ ] **Step 1: Run all unit tests**

Run: `npm run test`
Expected: all green, including the new `logic.test.ts`

- [ ] **Step 2: Run all E2E tests**

Run: `npm run test:e2e`
Expected: all green, including the new `text-case-converter.spec.ts`

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: succeeds, `/utilities/text-case-converter` present in the static output

- [ ] **Step 6: Confirm the verification checklist**

Confirm against `CLAUDE.md`'s Workflow A checklist:
- [ ] All unit tests green
- [ ] E2E test written and green
- [ ] Screenshot from E2E test reviewed
- [ ] No hardcoded values in `logic.ts`
- [ ] No unnecessary npm packages (none added)
- [ ] Mobile view works (Tailwind responsive — `max-w-lg mx-auto` stacks naturally)
- [ ] Module registered in `src/lib/registry.ts`
- [ ] Module added to `componentMap` in `src/components/utilities-module-content.tsx`
- [ ] Docs updated
- [ ] TypeScript check passes
- [ ] Build passes

- [ ] **Step 7: Push and prepare PR**

```bash
git push -u origin claude/new-session-sv0kbv
```

Then hand off to `/create-pr` with: related issue `#71`, PR body must contain `Closes #71`.
