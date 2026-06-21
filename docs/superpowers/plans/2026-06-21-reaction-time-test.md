# Reaction Time Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Reaction Time Test mini-game to the games category — dark screen waits for random delay, flashes green, player clicks to record reaction time in ms.

**Architecture:** Pure state-machine logic in `logic.ts` (4 phases: idle → waiting → ready → result), with all side effects (setTimeout, Date.now, localStorage, Math.random) owned by `index.tsx`. Messages in `messages.ts`. Registered in the central registry and games component map.

**Tech Stack:** Next.js 14 App Router, React (`'use client'`), TypeScript strict, Tailwind CSS, shadcn/ui Button, Vitest (unit), Playwright (E2E).

## Global Constraints

- TypeScript strict mode — no `any`
- No inline styles — Tailwind utility classes only
- `'use client'` only on `index.tsx` (needs hooks + browser APIs)
- All user-facing strings in `messages.ts` only — `logic.ts` is string-free
- `logic.ts` must be pure: no `Math.random()`, no `Date.now()`, no `localStorage` calls — all injected by callers
- No new npm packages
- Exact versions in `package.json` — no `^` or `~`
- Conventional Commits: `feat:`, `test:`, `docs:`
- localStorage key: `reaction-time-test:personal-best`

---

### Task 1: Module metadata

**Files:**
- Create: `src/modules/games/reaction-time-test/meta.ts`

**Interfaces:**
- Produces: `reactionTimeTestMeta` — `Module` type from `@/lib/types` — consumed by Task 5

- [ ] **Step 1: Create `meta.ts`**

```ts
import { Module } from '@/lib/types'

export const reactionTimeTestMeta: Module = {
  slug: 'reaction-time-test',
  title: 'Reaction Time Test',
  description: 'Wait for the screen to flash green, then tap as fast as you can. Track your best reaction time.',
  category: 'games',
  tags: ['reaction', 'speed', 'reflex'],
  createdAt: '2026-06-21',
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/games/reaction-time-test/meta.ts
git commit -m "feat: add reaction-time-test module metadata"
```

---

### Task 2: Pure game logic (TDD)

**Files:**
- Create: `src/modules/games/reaction-time-test/logic.test.ts`
- Create: `src/modules/games/reaction-time-test/logic.ts`

**Interfaces:**
- Produces (consumed by Tasks 3 and 4):
  - `GamePhase` — `'idle' | 'waiting' | 'ready' | 'result'`
  - `GameState` — `{ phase, readyAt, reactionTime, history, personalBest }`
  - `MAX_HISTORY` — `5`
  - `createInitialState(history?: number[], personalBest?: number | null): GameState`
  - `startWaiting(state: GameState): GameState`
  - `triggerReady(state: GameState, readyAt: number): GameState`
  - `recordResult(state: GameState, now: number): GameState`
  - `handleFalseStart(state: GameState): GameState`
  - `resetToIdle(state: GameState): GameState`

- [ ] **Step 1: Write the failing tests**

Create `src/modules/games/reaction-time-test/logic.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  startWaiting,
  triggerReady,
  recordResult,
  handleFalseStart,
  resetToIdle,
  MAX_HISTORY,
} from './logic'

describe('createInitialState', () => {
  it('starts in idle phase with all null fields', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.readyAt).toBeNull()
    expect(state.reactionTime).toBeNull()
    expect(state.history).toEqual([])
    expect(state.personalBest).toBeNull()
  })

  it('accepts pre-loaded history and personal best', () => {
    const state = createInitialState([300, 250], 250)
    expect(state.history).toEqual([300, 250])
    expect(state.personalBest).toBe(250)
  })
})

describe('startWaiting', () => {
  it('transitions to waiting phase and clears reactionTime', () => {
    const state = { ...createInitialState(), reactionTime: 300 }
    const next = startWaiting(state)
    expect(next.phase).toBe('waiting')
    expect(next.reactionTime).toBeNull()
  })
})

describe('triggerReady', () => {
  it('transitions to ready phase and stores readyAt timestamp', () => {
    const state = { ...createInitialState(), phase: 'waiting' as const }
    const next = triggerReady(state, 5000)
    expect(next.phase).toBe('ready')
    expect(next.readyAt).toBe(5000)
  })
})

describe('recordResult', () => {
  it('calculates reaction time as (now - readyAt)', () => {
    const state = { ...createInitialState(), phase: 'ready' as const, readyAt: 1000 }
    const next = recordResult(state, 1247)
    expect(next.reactionTime).toBe(247)
    expect(next.phase).toBe('result')
  })

  it('prepends the new time to history', () => {
    const state = { ...createInitialState([300]), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 250)
    expect(next.history[0]).toBe(250)
    expect(next.history[1]).toBe(300)
  })

  it('caps history at MAX_HISTORY entries, dropping the oldest', () => {
    const history = [200, 210, 220, 230, 240]
    const state = { ...createInitialState(history), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 190)
    expect(next.history).toHaveLength(MAX_HISTORY)
    expect(next.history[0]).toBe(190)
    expect(next.history[MAX_HISTORY - 1]).toBe(230)
  })

  it('updates personal best when new time is lower', () => {
    const state = { ...createInitialState([], 300), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 250)
    expect(next.personalBest).toBe(250)
  })

  it('keeps personal best when new time is higher', () => {
    const state = { ...createInitialState([], 200), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 300)
    expect(next.personalBest).toBe(200)
  })

  it('sets personal best on the very first attempt', () => {
    const state = { ...createInitialState(), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 247)
    expect(next.personalBest).toBe(247)
  })

  it('returns the state unchanged when readyAt is null', () => {
    const state = createInitialState()
    expect(recordResult(state, 1000)).toBe(state)
  })
})

describe('handleFalseStart', () => {
  it('transitions waiting → idle', () => {
    const state = { ...createInitialState(), phase: 'waiting' as const }
    const next = handleFalseStart(state)
    expect(next.phase).toBe('idle')
  })
})

describe('resetToIdle', () => {
  it('transitions result → idle and clears reactionTime', () => {
    const state = { ...createInitialState(), phase: 'result' as const, reactionTime: 247 }
    const next = resetToIdle(state)
    expect(next.phase).toBe('idle')
    expect(next.reactionTime).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /home/user/miniyard && npm run test -- --reporter=verbose src/modules/games/reaction-time-test/logic.test.ts
```

Expected: all tests fail with "Cannot find module './logic'".

- [ ] **Step 3: Implement `logic.ts`**

Create `src/modules/games/reaction-time-test/logic.ts`:

```ts
export type GamePhase = 'idle' | 'waiting' | 'ready' | 'result'

export interface GameState {
  phase: GamePhase
  readyAt: number | null
  reactionTime: number | null
  history: number[]
  personalBest: number | null
}

export const MAX_HISTORY = 5

export function createInitialState(
  history: number[] = [],
  personalBest: number | null = null
): GameState {
  return {
    phase: 'idle',
    readyAt: null,
    reactionTime: null,
    history,
    personalBest,
  }
}

export function startWaiting(state: GameState): GameState {
  return { ...state, phase: 'waiting', reactionTime: null }
}

export function triggerReady(state: GameState, readyAt: number): GameState {
  return { ...state, phase: 'ready', readyAt }
}

export function recordResult(state: GameState, now: number): GameState {
  if (state.readyAt === null) return state
  const reactionTime = now - state.readyAt
  const history = [reactionTime, ...state.history].slice(0, MAX_HISTORY)
  const personalBest =
    state.personalBest === null || reactionTime < state.personalBest
      ? reactionTime
      : state.personalBest
  return { ...state, phase: 'result', reactionTime, history, personalBest }
}

export function handleFalseStart(state: GameState): GameState {
  return { ...state, phase: 'idle' }
}

export function resetToIdle(state: GameState): GameState {
  return { ...state, phase: 'idle', reactionTime: null }
}
```

- [ ] **Step 4: Run tests — confirm they all pass**

```bash
cd /home/user/miniyard && npm run test -- --reporter=verbose src/modules/games/reaction-time-test/logic.test.ts
```

Expected: all 12 tests pass, no failures.

- [ ] **Step 5: Commit**

```bash
git add src/modules/games/reaction-time-test/logic.test.ts src/modules/games/reaction-time-test/logic.ts
git commit -m "feat: add reaction-time-test game logic with full test coverage"
```

---

### Task 3: User-facing strings

**Files:**
- Create: `src/modules/games/reaction-time-test/messages.ts`

**Interfaces:**
- Produces: `MESSAGES` — consumed by Task 4 (`index.tsx`)

- [ ] **Step 1: Create `messages.ts`**

```ts
export const MESSAGES = {
  tapToStart: 'Tap to Start',
  waitForGreen: 'Wait for green…',
  clickNow: 'Click!',
  tooEarly: 'Too early! Wait for green.',
  personalBestLabel: 'Personal Best',
  historyLabel: 'Last Attempts',
  tryAgain: 'Try Again',
  ms: (ms: number) => `${ms} ms`,
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/games/reaction-time-test/messages.ts
git commit -m "feat: add reaction-time-test messages"
```

---

### Task 4: React component

**Files:**
- Create: `src/modules/games/reaction-time-test/index.tsx`

**Interfaces:**
- Consumes:
  - `GameState`, `createInitialState`, `startWaiting`, `triggerReady`, `recordResult`, `handleFalseStart` from `./logic`
  - `MESSAGES` from `./messages`
  - `Button` from `@/components/ui/button`
  - `cn` from `@/lib/utils`
- Produces: default export `ReactionTimeTest` — consumed by Task 5

- [ ] **Step 1: Create `index.tsx`**

```tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  GameState,
  createInitialState,
  startWaiting,
  triggerReady,
  recordResult,
  handleFalseStart,
} from './logic'
import { MESSAGES } from './messages'

const PERSONAL_BEST_KEY = 'reaction-time-test:personal-best'

function loadPersonalBest(): number | null {
  try {
    const stored = localStorage.getItem(PERSONAL_BEST_KEY)
    return stored !== null ? parseInt(stored, 10) : null
  } catch {
    return null
  }
}

function savePersonalBest(ms: number): void {
  try {
    localStorage.setItem(PERSONAL_BEST_KEY, String(ms))
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export default function ReactionTimeTest() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [falseStart, setFalseStart] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const personalBest = loadPersonalBest()
    if (personalBest !== null) {
      setState((prev) => ({ ...prev, personalBest }))
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const beginWaiting = useCallback(() => {
    setFalseStart(false)
    clearTimer()
    setState((prev) => startWaiting(prev))
    const delay = Math.floor(Math.random() * 2500) + 1500
    timerRef.current = setTimeout(() => {
      const readyAt = Date.now()
      setState((prev) => triggerReady(prev, readyAt))
    }, delay)
  }, [clearTimer])

  const handleScreenClick = useCallback(() => {
    if (state.phase === 'waiting') {
      clearTimer()
      setFalseStart(true)
      setState(handleFalseStart)
      return
    }
    if (state.phase === 'ready') {
      setState((prev) => {
        const next = recordResult(prev, Date.now())
        if (next.personalBest !== null) savePersonalBest(next.personalBest)
        return next
      })
    }
  }, [state.phase, clearTimer])

  const isGreen = state.phase === 'ready'
  const isClickable = state.phase === 'waiting' || state.phase === 'ready'

  return (
    <div
      className={cn(
        'flex flex-col select-none touch-none transition-colors duration-100',
        'min-h-[calc(100dvh-8rem)]',
        isGreen ? 'bg-green-500' : 'bg-zinc-900'
      )}
      onClick={isClickable ? handleScreenClick : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={isGreen ? MESSAGES.clickNow : MESSAGES.waitForGreen}
    >
      <div className="flex flex-1 items-center justify-center px-6">
        {state.phase === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center">
            {falseStart && (
              <p className="text-yellow-400 text-lg font-semibold">{MESSAGES.tooEarly}</p>
            )}
            <Button
              size="lg"
              onClick={beginWaiting}
              className="px-10 py-6 text-xl font-bold"
            >
              {MESSAGES.tapToStart}
            </Button>
          </div>
        )}

        {state.phase === 'waiting' && (
          <p className="text-zinc-400 text-2xl font-semibold pointer-events-none">
            {MESSAGES.waitForGreen}
          </p>
        )}

        {state.phase === 'ready' && (
          <p className="text-white text-5xl font-extrabold drop-shadow-lg pointer-events-none">
            {MESSAGES.clickNow}
          </p>
        )}

        {state.phase === 'result' && state.reactionTime !== null && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-7xl font-extrabold text-white tabular-nums">
              {MESSAGES.ms(state.reactionTime)}
            </p>
            {state.personalBest !== null && (
              <p className="text-zinc-400 text-sm">
                {MESSAGES.personalBestLabel}:{' '}
                <span className="font-semibold text-white">
                  {MESSAGES.ms(state.personalBest)}
                </span>
              </p>
            )}
            <Button size="lg" onClick={beginWaiting} className="mt-2 px-10 font-bold">
              {MESSAGES.tryAgain}
            </Button>
          </div>
        )}
      </div>

      {state.history.length > 0 && (
        <div className="px-4 pb-6 flex flex-col items-center gap-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            {MESSAGES.historyLabel}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {state.history.map((ms, i) => (
              <span
                key={i}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-mono',
                  i === 0 && state.phase === 'result'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-zinc-800 text-zinc-300'
                )}
              >
                {MESSAGES.ms(ms)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/user/miniyard && npm run typecheck 2>&1 | head -30
```

Expected: no errors related to `reaction-time-test`.

- [ ] **Step 3: Commit**

```bash
git add src/modules/games/reaction-time-test/index.tsx
git commit -m "feat: add reaction-time-test React component"
```

---

### Task 5: Registration

**Files:**
- Modify: `src/lib/registry.ts`
- Modify: `src/app/games/[slug]/module-content.tsx`

**Interfaces:**
- Consumes: `reactionTimeTestMeta` from Task 1, `ReactionTimeTest` default export from Task 4

- [ ] **Step 1: Register in `src/lib/registry.ts`**

Add the import after the existing games import on line 5 and add the meta to the array on line 8:

```ts
import { Module, ModuleCategory } from './types'
import { unitConverterMeta } from '@/modules/utilities/unit-converter/meta'
import { base64ConverterMeta } from '@/modules/utilities/base64-converter/meta'
import { passwordStrengthCheckerMeta } from '@/modules/utilities/password-strength-checker/meta'
import { memoryCardMeta } from '@/modules/games/memory-card/meta'
import { typingSpeedTestMeta } from '@/modules/games/typing-speed-test/meta'
import { reactionTimeTestMeta } from '@/modules/games/reaction-time-test/meta'

export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, passwordStrengthCheckerMeta, memoryCardMeta, typingSpeedTestMeta, reactionTimeTestMeta]

export function getModulesByCategory(category: ModuleCategory) {
  return registry.filter((m) => m.category === category)
}

export function getModuleBySlug(slug: string) {
  return registry.find((m) => m.slug === slug)
}
```

- [ ] **Step 2: Add to `componentMap` in `src/app/games/[slug]/module-content.tsx`**

The current file at `src/app/games/[slug]/module-content.tsx` is a `'use client'` component. Add the new entry to `componentMap`:

```tsx
'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  'memory-card': dynamic(() => import('@/modules/games/memory-card'), { loading: ModuleSkeleton, ssr: false }),
  'typing-speed-test': dynamic(() => import('@/modules/games/typing-speed-test'), { loading: ModuleSkeleton, ssr: false }),
  'reaction-time-test': dynamic(() => import('@/modules/games/reaction-time-test'), { loading: ModuleSkeleton, ssr: false }),
}

export function GamesModuleContent({ slug }: { slug: string }) {
  const Component = componentMap[slug as keyof typeof componentMap]
  if (!Component) return null
  return <Component />
}
```

- [ ] **Step 3: Run typecheck and unit tests**

```bash
cd /home/user/miniyard && npm run typecheck && npm run test
```

Expected: no TypeScript errors, all unit tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/registry.ts src/app/games/[slug]/module-content.tsx
git commit -m "feat: register reaction-time-test in registry and component map"
```

---

### Task 6: E2E test

**Files:**
- Create: `tests/e2e/reaction-time-test.spec.ts`

- [ ] **Step 1: Create the E2E test**

```ts
import { test, expect } from '@playwright/test'

test.describe('Reaction Time Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/reaction-time-test')
  })

  test('loads in idle state with Tap to Start button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Tap to Start' })).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-idle.png' })
  })

  test('shows wait-for-green message after starting', async ({ page }) => {
    await page.getByRole('button', { name: 'Tap to Start' }).click()
    await expect(page.getByText('Wait for green…')).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-waiting.png' })
  })

  test('shows false start message when clicking too early', async ({ page }) => {
    await page.getByRole('button', { name: 'Tap to Start' }).click()
    await expect(page.getByText('Wait for green…')).toBeVisible()
    // Click the waiting screen — triggers false start
    await page.getByRole('button', { name: 'Wait for green…' }).click()
    await expect(page.getByText('Too early! Wait for green.')).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-false-start.png' })
  })

  test('shows reaction time after green screen click', async ({ page }) => {
    await page.getByRole('button', { name: 'Tap to Start' }).click()
    // Wait up to 5 s for green screen (max delay is 4 s)
    await expect(page.getByRole('button', { name: 'Click!' })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Click!' }).click()
    await expect(page.getByText(/\d+ ms/)).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-result.png' })
  })
})
```

- [ ] **Step 2: Run the E2E test**

```bash
cd /home/user/miniyard && npm run test:e2e -- --grep "Reaction Time Test" 2>&1 | tail -20
```

Expected: all 4 tests pass, screenshots written to `test-results/`.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/reaction-time-test.spec.ts
git commit -m "test: add Reaction Time Test E2E tests with screenshots"
```

---

### Task 7: Documentation

**Files:**
- Modify: `README.md` (games table)

- [ ] **Step 1: Add the game to the Games table in `README.md`**

Find the Games table (around line 23–24) and add a new row:

```markdown
| [Reaction Time Test](src/modules/games/reaction-time-test) | Wait for the screen to flash green, then tap as fast as you can. Track your best reaction time. |
```

The table should look like:

```markdown
### 🎮 Games
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| [Memory Card Matching](src/modules/games/memory-card) | Flip cards two at a time to find all 8 emoji pairs. Beat your best move count! |
| [Typing Speed Test](src/modules/games/typing-speed-test) | Type a random passage as fast and accurately as you can in 60 seconds. Track your WPM and accuracy. |
| [Reaction Time Test](src/modules/games/reaction-time-test) | Wait for the screen to flash green, then tap as fast as you can. Track your best reaction time. |
```

- [ ] **Step 2: Verify markdown lint**

```bash
cd /home/user/miniyard && npm run lint:md 2>&1 | tail -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Reaction Time Test to README games table"
```

---

## Final Verification

Run all checks before opening the PR:

```bash
cd /home/user/miniyard && npm run test && npm run typecheck && npm run build 2>&1 | tail -20
```

Expected: all unit tests pass, no TypeScript errors, build succeeds.
