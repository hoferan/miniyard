# Password Strength Checker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `password-strength-checker` utility module that scores a password against 6 rule-based checks and shows a color-coded strength bar with actionable feedback — fully client-side.

**Architecture:** Pure logic in `logic.ts` returns a `StrengthResult` with score (0–6), level (0–4), and a typed list of failed check keys. `messages.ts` maps those keys to display strings, keeping `logic.ts` free of UI copy. `index.tsx` composes both with a live password input and Eye/EyeOff toggle.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, shadcn/ui (`Input`, `Label`, `Button`), lucide-react (`Eye`, `EyeOff`), Vitest (unit), Playwright (E2E).

## Global Constraints

- No external npm packages — rule-based scoring only, no zxcvbn or similar
- All user-facing strings in `messages.ts`; `logic.ts` imports nothing from `messages.ts`
- `'use client'` required (live input state)
- No inline styles — Tailwind utility classes only
- Pin exact npm versions (no `^` or `~`) if any package is added
- Slug: `password-strength-checker`; module directory: `src/modules/utilities/password-strength-checker/`
- All common-pattern checks are case-insensitive substring matches
- Common patterns list: `['123', '321', 'abc', 'qwerty', 'password', 'letmein', 'iloveyou']`
- Score → level mapping: 0–1 → 0, 2 → 1, 3 → 2, 4 → 3, 5–6 → 4
- Branch: `issue-16-password-strength-checker`; commit with `feat:` prefix

---

## Task 1: Module metadata

**Files:**
- Create: `src/modules/utilities/password-strength-checker/meta.ts`

**Interfaces:**
- Produces: `passwordStrengthCheckerMeta` (imported by Tasks 6 and later)

- [ ] **Step 1: Create `meta.ts`**

```typescript
import { Module } from '@/lib/types'

export const passwordStrengthCheckerMeta: Module = {
  slug: 'password-strength-checker',
  title: 'Password Strength Checker',
  description: 'Instantly score any password against six security rules — fully client-side, nothing is sent anywhere.',
  category: 'utilities',
  tags: ['password', 'security', 'checker', 'privacy'],
  createdAt: '2026-06-19',
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/utilities/password-strength-checker/meta.ts
git commit -m "feat: add password-strength-checker metadata"
```

---

## Task 2: Failing unit tests (TDD — red phase)

**Files:**
- Create: `src/modules/utilities/password-strength-checker/logic.test.ts`

**Interfaces:**
- Consumes: `checkPassword` from `./logic` (does not exist yet — tests will fail to import)
- Produces: verified-red test suite that Task 3 must make green

- [ ] **Step 1: Create `logic.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { checkPassword } from './logic'

describe('checkPassword — empty input', () => {
  it('returns score 0 and level 0 for empty string', () => {
    const result = checkPassword('')
    expect(result.score).toBe(0)
    expect(result.level).toBe(0)
  })

  it('fails all 6 checks for empty string', () => {
    const result = checkPassword('')
    expect(result.failedChecks).toHaveLength(6)
  })
})

describe('checkPassword — MIN_LENGTH_8', () => {
  it('passes for exactly 8 characters', () => {
    const { failedChecks } = checkPassword('Xzwvuts1')
    expect(failedChecks).not.toContain('MIN_LENGTH_8')
  })

  it('fails for 7 characters', () => {
    const { failedChecks } = checkPassword('Xzwvuts')
    expect(failedChecks).toContain('MIN_LENGTH_8')
  })
})

describe('checkPassword — MIN_LENGTH_12', () => {
  it('passes for exactly 12 characters', () => {
    const { failedChecks } = checkPassword('Xzwvutsrqp1!')
    expect(failedChecks).not.toContain('MIN_LENGTH_12')
  })

  it('fails for 11 characters', () => {
    const { failedChecks } = checkPassword('Xzwvutsrqp1')
    expect(failedChecks).toContain('MIN_LENGTH_12')
  })
})

describe('checkPassword — HAS_UPPERCASE', () => {
  it('passes when an uppercase letter is present', () => {
    const { failedChecks } = checkPassword('Xyz')
    expect(failedChecks).not.toContain('HAS_UPPERCASE')
  })

  it('fails when all letters are lowercase', () => {
    const { failedChecks } = checkPassword('xyz')
    expect(failedChecks).toContain('HAS_UPPERCASE')
  })
})

describe('checkPassword — HAS_DIGIT', () => {
  it('passes when a digit is present', () => {
    const { failedChecks } = checkPassword('xyz1')
    expect(failedChecks).not.toContain('HAS_DIGIT')
  })

  it('fails when no digit is present', () => {
    const { failedChecks } = checkPassword('xyzwvuts')
    expect(failedChecks).toContain('HAS_DIGIT')
  })
})

describe('checkPassword — HAS_SPECIAL', () => {
  it('passes for ! character', () => {
    const { failedChecks } = checkPassword('xyz!')
    expect(failedChecks).not.toContain('HAS_SPECIAL')
  })

  it('passes for @ character', () => {
    const { failedChecks } = checkPassword('xyz@')
    expect(failedChecks).not.toContain('HAS_SPECIAL')
  })

  it('fails for alphanumeric-only input', () => {
    const { failedChecks } = checkPassword('xyz123')
    expect(failedChecks).toContain('HAS_SPECIAL')
  })
})

describe('checkPassword — NO_COMMON_PATTERN', () => {
  it('passes for a string with no known patterns', () => {
    const { failedChecks } = checkPassword('xzwvutsr')
    expect(failedChecks).not.toContain('NO_COMMON_PATTERN')
  })

  it('fails when "password" is present', () => {
    const { failedChecks } = checkPassword('password1')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "PASSWORD" is present (case-insensitive)', () => {
    const { failedChecks } = checkPassword('PASSWORD1')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "qwerty" is present', () => {
    const { failedChecks } = checkPassword('qwerty99!')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "123" is present', () => {
    const { failedChecks } = checkPassword('Xzwvuts123!')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "letmein" is present', () => {
    const { failedChecks } = checkPassword('letmein99')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })
})

describe('checkPassword — score to level mapping', () => {
  // score 0 → level 0 (Very Weak): empty string fails all checks
  it('maps score 0 to level 0', () => {
    expect(checkPassword('').level).toBe(0)
  })

  // score 1 → level 0 (Very Weak): 7-char string with no other passing checks
  // 'zxwvuts' (7 chars, lowercase, no digit, no special, no common pattern)
  it('maps score 1 to level 0', () => {
    expect(checkPassword('zxwvuts').level).toBe(0)
  })

  // score 2 → level 1 (Weak): 8-char lowercase, no digit, no special, no common pattern
  // 'xzwvutsr' passes MIN_LENGTH_8 + NO_COMMON_PATTERN = 2 points
  it('maps score 2 to level 1', () => {
    expect(checkPassword('xzwvutsr').level).toBe(1)
  })

  // score 3 → level 2 (Fair): 8 chars + uppercase + no common pattern
  // 'Xzwvutsr' passes MIN_LENGTH_8 + HAS_UPPERCASE + NO_COMMON_PATTERN = 3 points
  it('maps score 3 to level 2', () => {
    expect(checkPassword('Xzwvutsr').level).toBe(2)
  })

  // score 4 → level 3 (Strong): 8 chars + uppercase + digit + no common pattern
  // 'Xzwvuts1' passes MIN_LENGTH_8 + HAS_UPPERCASE + HAS_DIGIT + NO_COMMON_PATTERN = 4 points
  it('maps score 4 to level 3', () => {
    expect(checkPassword('Xzwvuts1').level).toBe(3)
  })

  // score 5 → level 4 (Very Strong): 8 chars + uppercase + digit + special + no common pattern
  // 'Xzwvuts1!' passes all except MIN_LENGTH_12 = 5 points
  it('maps score 5 to level 4', () => {
    expect(checkPassword('Xzwvuts1!').level).toBe(4)
  })

  // score 6 → level 4 (Very Strong): all 6 checks pass
  // 'Xzwvutsrqp1!' — 12 chars, uppercase, digit, special, no common pattern
  it('maps score 6 to level 4', () => {
    expect(checkPassword('Xzwvutsrqp1!').level).toBe(4)
  })
})

describe('checkPassword — feedback list', () => {
  it('returns empty failedChecks when all checks pass', () => {
    const { failedChecks } = checkPassword('Xzwvutsrqp1!')
    expect(failedChecks).toHaveLength(0)
  })

  it('reports only the failed checks', () => {
    // 'xzwvutsr': passes MIN_LENGTH_8 + NO_COMMON_PATTERN, fails the rest
    const { failedChecks } = checkPassword('xzwvutsr')
    expect(failedChecks).not.toContain('MIN_LENGTH_8')
    expect(failedChecks).not.toContain('NO_COMMON_PATTERN')
    expect(failedChecks).toContain('MIN_LENGTH_12')
    expect(failedChecks).toContain('HAS_UPPERCASE')
    expect(failedChecks).toContain('HAS_DIGIT')
    expect(failedChecks).toContain('HAS_SPECIAL')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail (red)**

```bash
npm run test -- --reporter=verbose src/modules/utilities/password-strength-checker/logic.test.ts
```

Expected: error like `Cannot find module './logic'` or all tests fail. Proceed only when you see failures.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/modules/utilities/password-strength-checker/logic.test.ts
git commit -m "test: add failing unit tests for password-strength-checker logic"
```

---

## Task 3: Logic implementation (green phase)

**Files:**
- Create: `src/modules/utilities/password-strength-checker/logic.ts`

**Interfaces:**
- Produces (consumed by Tasks 4, 5):
  ```typescript
  export type CheckKey =
    | 'MIN_LENGTH_8'
    | 'MIN_LENGTH_12'
    | 'HAS_UPPERCASE'
    | 'HAS_DIGIT'
    | 'HAS_SPECIAL'
    | 'NO_COMMON_PATTERN'

  export type StrengthLevel = 0 | 1 | 2 | 3 | 4

  export interface StrengthResult {
    score: number          // 0–6
    level: StrengthLevel   // 0–4
    failedChecks: CheckKey[]
  }

  export function checkPassword(password: string): StrengthResult
  ```

- [ ] **Step 1: Create `logic.ts`**

```typescript
export type CheckKey =
  | 'MIN_LENGTH_8'
  | 'MIN_LENGTH_12'
  | 'HAS_UPPERCASE'
  | 'HAS_DIGIT'
  | 'HAS_SPECIAL'
  | 'NO_COMMON_PATTERN'

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

export interface StrengthResult {
  score: number
  level: StrengthLevel
  failedChecks: CheckKey[]
}

const COMMON_PATTERNS = ['123', '321', 'abc', 'qwerty', 'password', 'letmein', 'iloveyou']

function scoreToLevel(score: number): StrengthLevel {
  if (score <= 1) return 0
  if (score === 2) return 1
  if (score === 3) return 2
  if (score === 4) return 3
  return 4
}

export function checkPassword(password: string): StrengthResult {
  const lower = password.toLowerCase()

  const checks: Array<{ key: CheckKey; passes: boolean }> = [
    { key: 'MIN_LENGTH_8', passes: password.length >= 8 },
    { key: 'MIN_LENGTH_12', passes: password.length >= 12 },
    { key: 'HAS_UPPERCASE', passes: /[A-Z]/.test(password) },
    { key: 'HAS_DIGIT', passes: /[0-9]/.test(password) },
    { key: 'HAS_SPECIAL', passes: /[^a-zA-Z0-9]/.test(password) },
    { key: 'NO_COMMON_PATTERN', passes: !COMMON_PATTERNS.some((p) => lower.includes(p)) },
  ]

  const score = checks.filter((c) => c.passes).length
  const level = scoreToLevel(score)
  const failedChecks = checks.filter((c) => !c.passes).map((c) => c.key)

  return { score, level, failedChecks }
}
```

- [ ] **Step 2: Run tests — verify all pass (green)**

```bash
npm run test -- --reporter=verbose src/modules/utilities/password-strength-checker/logic.test.ts
```

Expected: all tests PASS. If any fail, fix `logic.ts` before proceeding.

- [ ] **Step 3: Commit**

```bash
git add src/modules/utilities/password-strength-checker/logic.ts
git commit -m "feat: implement password-strength-checker logic"
```

---

## Task 4: User-facing strings

**Files:**
- Create: `src/modules/utilities/password-strength-checker/messages.ts`

**Interfaces:**
- Consumes: `CheckKey`, `StrengthLevel` from `./logic`
- Produces (consumed by Task 5):
  ```typescript
  export const STRENGTH_LABELS: Record<StrengthLevel, string>
  export const FEEDBACK: Record<CheckKey, string>
  export const UI: { inputLabel, placeholder, showPassword, hidePassword, feedbackHeading }
  ```

- [ ] **Step 1: Create `messages.ts`**

```typescript
import type { CheckKey, StrengthLevel } from './logic'

export const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  0: 'Very Weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Strong',
  4: 'Very Strong',
}

export const FEEDBACK: Record<CheckKey, string> = {
  MIN_LENGTH_8: 'Use at least 8 characters',
  MIN_LENGTH_12: 'Use at least 12 characters',
  HAS_UPPERCASE: 'Add an uppercase letter',
  HAS_DIGIT: 'Add a number',
  HAS_SPECIAL: 'Add a special character (e.g. ! @ # $)',
  NO_COMMON_PATTERN: 'Avoid common patterns (e.g. "password", "qwerty", "123")',
}

export const UI = {
  inputLabel: 'Password',
  placeholder: 'Type a password to check its strength…',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  feedbackHeading: 'How to improve:',
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/utilities/password-strength-checker/messages.ts
git commit -m "feat: add password-strength-checker messages"
```

---

## Task 5: React UI component

**Files:**
- Create: `src/modules/utilities/password-strength-checker/index.tsx`

**Interfaces:**
- Consumes:
  - `checkPassword`, `StrengthLevel` from `./logic`
  - `STRENGTH_LABELS`, `FEEDBACK`, `UI` from `./messages`
  - `Input` from `@/components/ui/input`
  - `Label` from `@/components/ui/label`
  - `Button` from `@/components/ui/button`
  - `Eye`, `EyeOff` from `lucide-react`
- Produces: default export `PasswordStrengthChecker` component (consumed by Task 6 componentMap)

**Color mapping for the 5-segment bar (by level):**

| Level | Filled segments | Segment color |
|-------|----------------|---------------|
| 0 | 1 | `bg-red-500` |
| 1 | 2 | `bg-orange-400` |
| 2 | 3 | `bg-yellow-400` |
| 3 | 4 | `bg-lime-500` |
| 4 | 5 | `bg-green-500` |

- [ ] **Step 1: Create `index.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { checkPassword, type StrengthLevel } from './logic'
import { STRENGTH_LABELS, FEEDBACK, UI } from './messages'

const BAR_COLORS: Record<StrengthLevel, string> = {
  0: 'bg-red-500',
  1: 'bg-orange-400',
  2: 'bg-yellow-400',
  3: 'bg-lime-500',
  4: 'bg-green-500',
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  const result = checkPassword(password)
  const isEmpty = password === ''

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="password-input">{UI.inputLabel}</Label>
        <div className="relative">
          <Input
            id="password-input"
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={UI.placeholder}
            className="pr-10"
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? UI.hidePassword : UI.showPassword}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isEmpty && (
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{STRENGTH_LABELS[result.level]}</span>
              <span className="text-xs text-muted-foreground">{result.score} / 6</span>
            </div>
            <div className="flex gap-1" role="progressbar" aria-valuenow={result.level} aria-valuemin={0} aria-valuemax={4}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors duration-200 ${
                    i <= result.level ? BAR_COLORS[result.level] : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {result.failedChecks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{UI.feedbackHeading}</p>
              <ul className="space-y-1">
                {result.failedChecks.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 text-destructive" aria-hidden="true">✕</span>
                    {FEEDBACK[key]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
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
git add src/modules/utilities/password-strength-checker/index.tsx
git commit -m "feat: add password-strength-checker UI component"
```

---

## Task 6: Registration

**Files:**
- Modify: `src/lib/registry.ts`
- Modify: `src/app/utilities/[slug]/module-content.tsx`

**Interfaces:**
- Consumes: `passwordStrengthCheckerMeta` from Task 1; default export from Task 5

- [ ] **Step 1: Add to `src/lib/registry.ts`**

Add the import after the existing utility imports:

```typescript
import { passwordStrengthCheckerMeta } from '@/modules/utilities/password-strength-checker/meta'
```

Add to the `registry` array:

```typescript
export const registry: Module[] = [
  unitConverterMeta,
  base64ConverterMeta,
  passwordStrengthCheckerMeta,   // ← add this
  memoryCardMeta,
  typingSpeedTestMeta,
]
```

- [ ] **Step 2: Add to `src/app/utilities/[slug]/module-content.tsx`**

Add the dynamic import inside `componentMap`:

```typescript
const componentMap = {
  'unit-converter': dynamic(() => import('@/modules/utilities/unit-converter'), { loading: ModuleSkeleton, ssr: false }),
  'base64-converter': dynamic(() => import('@/modules/utilities/base64-converter'), { loading: ModuleSkeleton, ssr: false }),
  'password-strength-checker': dynamic(() => import('@/modules/utilities/password-strength-checker'), { loading: ModuleSkeleton, ssr: false }),
}
```

- [ ] **Step 3: Run full check**

```bash
npm run typecheck && npm run test
```

Expected: typecheck passes, all unit tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/registry.ts src/app/utilities/[slug]/module-content.tsx
git commit -m "feat: register password-strength-checker in registry and componentMap"
```

---

## Task 7: E2E test

**Files:**
- Create: `tests/e2e/password-strength-checker.spec.ts`

**Interfaces:**
- Consumes: running dev server at `/utilities/password-strength-checker`

- [ ] **Step 1: Create E2E test**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Password Strength Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/password-strength-checker')
  })

  test('loads with empty input and no strength bar', async ({ page }) => {
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('progressbar')).not.toBeVisible()
    await page.screenshot({ path: 'test-results/password-strength-checker-idle.png' })
  })

  test('shows strength bar and label after typing', async ({ page }) => {
    await page.getByLabel('Password').fill('hello')
    await expect(page.getByRole('progressbar')).toBeVisible()
    await expect(page.getByText('Very Weak')).toBeVisible()
  })

  test('shows green bar and no feedback for a strong password', async ({ page }) => {
    await page.getByLabel('Password').fill('Xzwvutsrqp1!')
    await expect(page.getByText('Very Strong')).toBeVisible()
    await expect(page.getByText('How to improve:')).not.toBeVisible()
  })

  test('shows feedback bullets for a weak password', async ({ page }) => {
    await page.getByLabel('Password').fill('hello')
    await expect(page.getByText('How to improve:')).toBeVisible()
    await expect(page.getByText('Use at least 8 characters')).toBeVisible()
  })

  test('show/hide toggle changes input type', async ({ page }) => {
    const input = page.getByLabel('Password')
    await expect(input).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Show password' }).click()
    await expect(input).toHaveAttribute('type', 'text')
    await page.getByRole('button', { name: 'Hide password' }).click()
    await expect(input).toHaveAttribute('type', 'password')
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/password-strength-checker.spec.ts
git commit -m "test: add E2E tests for password-strength-checker"
```

---

## Task 8: Documentation

**Files:**
- Modify: `README.md` (add module to utilities table)

- [ ] **Step 1: Find the utilities table in README.md**

Open `README.md` and locate the Utilities section. It contains a table of existing modules. Add a new row for the password checker. Example — find the last row in the utilities table and add after it:

```text
| [Password Strength Checker](https://miniyard.netlify.app/utilities/password-strength-checker) | Score a password against 6 security rules with live feedback | `password-strength-checker` |
```

Match the exact column format used by existing rows in that table.

- [ ] **Step 2: Run markdown lint**

```bash
npm run lint:md
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add password-strength-checker to README"
```

---

## Task 9: Final verification

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

Expected: all E2E tests pass, screenshot saved to `test-results/password-strength-checker-idle.png`.

- [ ] **Step 5: Push branch**

```bash
git push -u origin issue-16-password-strength-checker
```
