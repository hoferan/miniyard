# Colour Sequence Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Colour Sequence Memory" game module to `src/modules/games/colour-sequence-memory/` — a Simon Says-style memory game on a 2x2 grid of 4 colored tiles, tap-only controls, and a localStorage high score.

**Architecture:** Pure game-state logic (`logic.ts`) with no DOM/React dependencies, driven by a `'use client'` React component (`index.tsx`) that renders a 2x2 grid of colored tile buttons, animates sequence playback with `setTimeout` chains, and handles tap input. Follows the same structure as the existing `snake` module (phase-based state machine, Dialog overlays, `createHighScoreStore`).

**Tech Stack:** Next.js 14 (App Router), React, TypeScript strict, Tailwind CSS, shadcn/ui (`Dialog`, `Button`), lucide-react (`Palette`, `Trophy`), Vitest, Playwright.

## Global Constraints

- TypeScript strict mode — no `any`
- Functional components only, `'use client'` only where interactivity/hooks/browser APIs are needed
- No inline styles — Tailwind utility classes only
- Logic (`logic.ts`) is pure — no React import, no `Math.random()` calls except as an injected default parameter
- User-facing strings live in `messages.ts`; `logic.ts` stays string-free
- Tile count: 4 (`TILE_COUNT = 4`), arranged in a 2x2 grid, colors red/blue/green/yellow
- Flash speed: `800ms` base interval per tile at round 1, `-20ms` per round, floor `300ms`
- High score persisted under localStorage key `colour-sequence-memory:high-score` via `createHighScoreStore` (`src/lib/high-score.ts`, already exists — do not modify)
- Taps outside the `input` phase must be ignored, not fatal
- Commits use Conventional Commits (`feat:`, `test:`, etc.)

---

### Task 1: Module metadata + icon registration

**Files:**
- Create: `src/modules/games/colour-sequence-memory/meta.ts`
- Modify: `src/lib/icons.ts`

**Interfaces:**
- Produces: `colourSequenceMemoryMeta: Module` (from `@/lib/types`), consumed by Task 5 (`registry.ts`)
- Produces: `ICON_MAP['palette']` entry, consumed by any UI that renders `mod.icon`

- [ ] **Step 1: Create the metadata file**

```ts
// src/modules/games/colour-sequence-memory/meta.ts
import { Module } from '@/lib/types'

export const colourSequenceMemoryMeta: Module = {
  slug: 'colour-sequence-memory',
  title: 'Colour Sequence Memory',
  description:
    'Watch the flashing colour sequence, then repeat it by tapping the tiles in order. Each round adds one more step — how long can you remember?',
  category: 'games',
  tags: ['memory', 'simon', 'sequence'],
  createdAt: '2026-07-06',
  icon: 'palette',
}
```

- [ ] **Step 2: Add the `palette` icon to the icon map**

Modify `src/lib/icons.ts` — current content:

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

New content:

```ts
import { Ruler, Code2, ShieldCheck, LayoutGrid, Keyboard, Zap, Worm, Pipette, CaseSensitive, Palette } from 'lucide-react'
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
  'palette': Palette,
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/modules/games/colour-sequence-memory/meta.ts src/lib/icons.ts
git commit -m "feat: add Colour Sequence Memory module metadata and icon"
```

---

### Task 2: Game logic (`logic.ts`) with unit tests

**Files:**
- Create: `src/modules/games/colour-sequence-memory/logic.test.ts`
- Create: `src/modules/games/colour-sequence-memory/logic.ts`

**Interfaces:**
- Produces (consumed by Task 4 `index.tsx`):
  - `TILE_COUNT: number`
  - `type Phase = 'idle' | 'showing' | 'input' | 'gameover'`
  - `interface GameState { sequence: number[]; inputIndex: number; score: number; phase: Phase }`
  - `createInitialState(): GameState`
  - `startGame(state: GameState, random?: () => number): GameState`
  - `beginInput(state: GameState): GameState`
  - `submitTap(state: GameState, tileIndex: number, random?: () => number): GameState`
  - `getFlashIntervalMs(round: number): number`

- [ ] **Step 1: Write the failing test file**

```ts
// src/modules/games/colour-sequence-memory/logic.test.ts
import { describe, it, expect } from 'vitest'
import {
  TILE_COUNT,
  createInitialState,
  startGame,
  beginInput,
  submitTap,
  getFlashIntervalMs,
} from './logic'

describe('createInitialState', () => {
  it('starts idle with an empty sequence and zero score', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.sequence).toEqual([])
    expect(state.inputIndex).toBe(0)
    expect(state.score).toBe(0)
  })
})

describe('startGame', () => {
  it('appends one tile within range and transitions to showing', () => {
    const state = startGame(createInitialState(), () => 0.5)
    expect(state.phase).toBe('showing')
    expect(state.sequence).toHaveLength(1)
    expect(state.sequence[0]).toBeGreaterThanOrEqual(0)
    expect(state.sequence[0]).toBeLessThan(TILE_COUNT)
  })

  it('does nothing if not idle', () => {
    const state = startGame(createInitialState(), () => 0.5)
    expect(startGame(state, () => 0.1)).toEqual(state)
  })
})

describe('beginInput', () => {
  it('transitions showing to input', () => {
    const state = startGame(createInitialState(), () => 0)
    expect(beginInput(state).phase).toBe('input')
  })

  it('is ignored when not showing', () => {
    const state = createInitialState()
    expect(beginInput(state)).toEqual(state)
  })
})

describe('submitTap', () => {
  it('advances inputIndex on a correct tap mid-sequence', () => {
    const showing = startGame(createInitialState(), () => 0) // sequence: [0]
    const withSecondTile = { ...showing, sequence: [0, 1] }
    const input = beginInput(withSecondTile)
    const next = submitTap(input, 0)
    expect(next.phase).toBe('input')
    expect(next.inputIndex).toBe(1)
    expect(next.sequence).toEqual([0, 1])
    expect(next.score).toBe(0)
  })

  it('completes the round on the last correct tap: appends a tile, resets inputIndex, increments score', () => {
    const state = beginInput(startGame(createInitialState(), () => 0)) // sequence: [0], phase input
    const next = submitTap(state, 0, () => 0.99)
    expect(next.phase).toBe('showing')
    expect(next.inputIndex).toBe(0)
    expect(next.score).toBe(1)
    expect(next.sequence).toEqual([0, 3])
  })

  it('ends the game on a wrong tap', () => {
    const state = beginInput(startGame(createInitialState(), () => 0)) // sequence: [0]
    const next = submitTap(state, 1)
    expect(next.phase).toBe('gameover')
    expect(next.sequence).toEqual([0])
    expect(next.score).toBe(0)
  })

  it('is ignored when phase is not input', () => {
    const state = createInitialState()
    expect(submitTap(state, 0)).toEqual(state)
  })
})

describe('getFlashIntervalMs', () => {
  it('returns 800 at round 1', () => {
    expect(getFlashIntervalMs(1)).toBe(800)
  })

  it('decreases by 20ms per round', () => {
    expect(getFlashIntervalMs(6)).toBe(700)
  })

  it('floors at 300', () => {
    expect(getFlashIntervalMs(1000)).toBe(300)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/games/colour-sequence-memory/logic.test.ts`
Expected: FAIL — `Cannot find module './logic'` (file does not exist yet)

- [ ] **Step 3: Write the implementation**

```ts
// src/modules/games/colour-sequence-memory/logic.ts
export const TILE_COUNT = 4

export type Phase = 'idle' | 'showing' | 'input' | 'gameover'

export interface GameState {
  sequence: number[]
  inputIndex: number
  score: number
  phase: Phase
}

function pickRandomTile(random: () => number): number {
  return Math.floor(random() * TILE_COUNT)
}

export function createInitialState(): GameState {
  return {
    sequence: [],
    inputIndex: 0,
    score: 0,
    phase: 'idle',
  }
}

export function startGame(state: GameState, random: () => number = Math.random): GameState {
  if (state.phase !== 'idle') return state
  return {
    ...state,
    sequence: [pickRandomTile(random)],
    phase: 'showing',
  }
}

export function beginInput(state: GameState): GameState {
  if (state.phase !== 'showing') return state
  return { ...state, phase: 'input' }
}

export function submitTap(
  state: GameState,
  tileIndex: number,
  random: () => number = Math.random
): GameState {
  if (state.phase !== 'input') return state

  if (tileIndex !== state.sequence[state.inputIndex]) {
    return { ...state, phase: 'gameover' }
  }

  const nextInputIndex = state.inputIndex + 1
  if (nextInputIndex < state.sequence.length) {
    return { ...state, inputIndex: nextInputIndex }
  }

  return {
    ...state,
    sequence: [...state.sequence, pickRandomTile(random)],
    inputIndex: 0,
    score: state.score + 1,
    phase: 'showing',
  }
}

export function getFlashIntervalMs(round: number): number {
  const interval = 800 - (round - 1) * 20
  return Math.max(interval, 300)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/games/colour-sequence-memory/logic.test.ts`
Expected: PASS (all tests green)

- [ ] **Step 5: Commit**

```bash
git add src/modules/games/colour-sequence-memory/logic.ts src/modules/games/colour-sequence-memory/logic.test.ts
git commit -m "test: add Colour Sequence Memory game logic with unit tests"
```

---

### Task 3: User-facing strings (`messages.ts`)

**Files:**
- Create: `src/modules/games/colour-sequence-memory/messages.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `MESSAGES` object, consumed by Task 4 (`index.tsx`)

- [ ] **Step 1: Create the messages file**

```ts
// src/modules/games/colour-sequence-memory/messages.ts
export const MESSAGES = {
  scoreLabel: 'Score:',
  bestLabel: 'Best:',
  startTitle: 'Colour Sequence Memory',
  startDescription:
    'Watch the sequence light up, then tap the tiles in the same order. Each round adds one more step.',
  startButton: 'Start',
  newGame: 'New Game',
  gameOverTitle: 'Game Over',
  gameOverSummary: (score: number) => `You reached a sequence of ${score}.`,
  newBest: 'New best score!',
  playAgain: 'Play again',
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/games/colour-sequence-memory/messages.ts
git commit -m "feat: add Colour Sequence Memory user-facing strings"
```

---

### Task 4: Game UI component (`index.tsx`)

**Files:**
- Create: `src/modules/games/colour-sequence-memory/index.tsx`

**Interfaces:**
- Consumes from `./logic`: `type GameState`, `createInitialState`, `startGame`, `beginInput`, `submitTap`, `getFlashIntervalMs`
- Consumes from `./messages`: `MESSAGES`
- Consumes from `@/lib/high-score`: `createHighScoreStore`
- Consumes from `@/lib/utils`: `cn`
- Consumes from `@/components/ui/button`: `Button`
- Consumes from `@/components/ui/dialog`: `Dialog`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle`
- Produces: default export React component, consumed by Task 5 (`games-module-content.tsx` dynamic import)

- [ ] **Step 1: Create the component**

```tsx
// src/modules/games/colour-sequence-memory/index.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  type GameState,
  createInitialState,
  startGame,
  beginInput,
  submitTap,
  getFlashIntervalMs,
} from './logic'
import { MESSAGES } from './messages'
import { createHighScoreStore } from '@/lib/high-score'

const bestScoreStore = createHighScoreStore('colour-sequence-memory:high-score')

const TILE_LABELS = ['Red', 'Blue', 'Green', 'Yellow']
const TILE_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400']
const TAP_FLASH_MS = 200
const FLASH_ON_RATIO = 0.6

export default function ColourSequenceMemory() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [activeTile, setActiveTile] = useState<number | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setBestScore(bestScoreStore.load())
  }, [])

  useEffect(() => {
    if (state.phase !== 'showing') return
    const intervalMs = getFlashIntervalMs(state.sequence.length)
    const timeouts: ReturnType<typeof setTimeout>[] = []
    state.sequence.forEach((tile, i) => {
      timeouts.push(setTimeout(() => setActiveTile(tile), i * intervalMs))
      timeouts.push(
        setTimeout(() => setActiveTile(null), i * intervalMs + intervalMs * FLASH_ON_RATIO)
      )
    })
    timeouts.push(
      setTimeout(() => {
        setActiveTile(null)
        setState((prev) => beginInput(prev))
      }, state.sequence.length * intervalMs)
    )
    return () => timeouts.forEach(clearTimeout)
  }, [state.phase, state.sequence])

  useEffect(() => {
    if (state.phase === 'gameover') {
      const prev = bestScoreStore.load()
      const improved = prev === null || state.score > prev
      if (improved) bestScoreStore.save(state.score)
      setBestScore(improved ? state.score : prev)
      setIsNewBest(improved)
    }
  }, [state.phase, state.score])

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    }
  }, [])

  const handleTileTap = useCallback((tileIndex: number) => {
    setState((prev) => (prev.phase === 'input' ? submitTap(prev, tileIndex) : prev))
    setActiveTile(tileIndex)
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    tapTimeoutRef.current = setTimeout(() => setActiveTile(null), TAP_FLASH_MS)
  }, [])

  const handleNewGame = useCallback(() => {
    setState(createInitialState())
    setActiveTile(null)
    setIsNewBest(false)
  }, [])

  return (
    <main className="max-w-md mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">
          {MESSAGES.scoreLabel}{' '}
          <span className="font-bold text-foreground" data-testid="current-score">
            {state.score}
          </span>
        </span>
        {bestScore !== null && (
          <span className="text-muted-foreground">
            {MESSAGES.bestLabel} <span className="font-bold text-foreground">{bestScore}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 aspect-square select-none touch-none">
        {TILE_COLORS.map((color, i) => (
          <button
            key={i}
            type="button"
            aria-label={TILE_LABELS[i]}
            disabled={state.phase !== 'input'}
            onClick={() => handleTileTap(i)}
            className={cn(
              'rounded-lg transition-opacity disabled:cursor-not-allowed',
              color,
              activeTile === i ? 'opacity-100' : 'opacity-60'
            )}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={handleNewGame} variant="outline">
          {MESSAGES.newGame}
        </Button>
      </div>

      <Dialog open={state.phase === 'idle'} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-sm [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{MESSAGES.startTitle}</DialogTitle>
            <DialogDescription>{MESSAGES.startDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setState((prev) => startGame(prev))} className="w-full">
              {MESSAGES.startButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={state.phase === 'gameover'}
        onOpenChange={(open) => {
          if (!open) handleNewGame()
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <Trophy className="h-12 w-12 text-primary" aria-hidden="true" />
            <DialogTitle>{MESSAGES.gameOverTitle}</DialogTitle>
            <DialogDescription>{MESSAGES.gameOverSummary(state.score)}</DialogDescription>
          </DialogHeader>
          {isNewBest && (
            <p className="text-center text-sm font-semibold text-green-500">{MESSAGES.newBest}</p>
          )}
          <DialogFooter>
            <Button onClick={handleNewGame} className="w-full">
              {MESSAGES.playAgain}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/modules/games/colour-sequence-memory/index.tsx
git commit -m "feat: add Colour Sequence Memory game UI component"
```

---

### Task 5: Register the module

**Files:**
- Modify: `src/lib/registry.ts`
- Modify: `src/components/games-module-content.tsx`

**Interfaces:**
- Consumes: `colourSequenceMemoryMeta` from Task 1, default export from Task 4
- Produces: `/games/colour-sequence-memory` route resolves via `getModuleBySlug('colour-sequence-memory')` and `GamesModuleContent`

- [ ] **Step 1: Add the module to the registry**

Modify `src/lib/registry.ts` — current content:

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

New content:

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
import { colourSequenceMemoryMeta } from '@/modules/games/colour-sequence-memory/meta'

export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, passwordStrengthCheckerMeta, colorConverterMeta, textCaseConverterMeta, memoryCardMeta, typingSpeedTestMeta, reactionTimeTestMeta, snakeMeta, colourSequenceMemoryMeta]

export function getModulesByCategory(category: ModuleCategory) {
  return registry.filter((m) => m.category === category)
}

export function getModuleBySlug(slug: string) {
  return registry.find((m) => m.slug === slug)
}
```

- [ ] **Step 2: Add the module to the games componentMap**

Modify `src/components/games-module-content.tsx` — current content:

```tsx
'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  'memory-card': dynamic(() => import('@/modules/games/memory-card'), { loading: ModuleSkeleton, ssr: false }),
  'typing-speed-test': dynamic(() => import('@/modules/games/typing-speed-test'), { loading: ModuleSkeleton, ssr: false }),
  'reaction-time-test': dynamic(() => import('@/modules/games/reaction-time-test'), { loading: ModuleSkeleton, ssr: false }),
  'snake': dynamic(() => import('@/modules/games/snake'), { loading: ModuleSkeleton, ssr: false }),
}

export function GamesModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
```

New content:

```tsx
'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  'memory-card': dynamic(() => import('@/modules/games/memory-card'), { loading: ModuleSkeleton, ssr: false }),
  'typing-speed-test': dynamic(() => import('@/modules/games/typing-speed-test'), { loading: ModuleSkeleton, ssr: false }),
  'reaction-time-test': dynamic(() => import('@/modules/games/reaction-time-test'), { loading: ModuleSkeleton, ssr: false }),
  'snake': dynamic(() => import('@/modules/games/snake'), { loading: ModuleSkeleton, ssr: false }),
  'colour-sequence-memory': dynamic(() => import('@/modules/games/colour-sequence-memory'), { loading: ModuleSkeleton, ssr: false }),
}

export function GamesModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds, `/games/colour-sequence-memory` route generated

- [ ] **Step 4: Commit**

```bash
git add src/lib/registry.ts src/components/games-module-content.tsx
git commit -m "feat: register Colour Sequence Memory game module"
```

---

### Task 6: E2E test

**Files:**
- Create: `tests/e2e/colour-sequence-memory.spec.ts`

**Interfaces:**
- Consumes: the running app at `/games/colour-sequence-memory` (registered in Task 5)

- [ ] **Step 1: Write the E2E test**

```ts
// tests/e2e/colour-sequence-memory.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Colour Sequence Memory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/colour-sequence-memory')
  })

  test('loads with a Start button in the idle overlay', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
    await page.screenshot({ path: 'test-results/colour-sequence-memory-idle.png' })
  })

  test('starts the game and completes the first round by tapping the correct tile', async ({
    page,
  }) => {
    // Math.random is patched before any page script runs, so pickRandomTile
    // always resolves to tile index 0 ("Red") — makes the flashed sequence
    // deterministic for the test.
    await page.addInitScript(() => {
      Math.random = () => 0
    })
    await page.goto('/games/colour-sequence-memory')

    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeHidden()

    const redTile = page.getByRole('button', { name: 'Red' })
    await expect(redTile).toBeEnabled({ timeout: 5000 })
    await redTile.click()

    await expect(page.getByTestId('current-score')).toHaveText('1')
    await page.screenshot({ path: 'test-results/colour-sequence-memory-playing.png' })
  })
})
```

- [ ] **Step 2: Run the E2E test**

Run: `npx playwright test tests/e2e/colour-sequence-memory.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 3: Review the screenshots**

Open `test-results/colour-sequence-memory-idle.png` and
`test-results/colour-sequence-memory-playing.png` and confirm the tile grid
and idle overlay render correctly.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/colour-sequence-memory.spec.ts
git commit -m "test: add Colour Sequence Memory game E2E test"
```

---

### Task 7: Update documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing

- [ ] **Step 1: Add Colour Sequence Memory to the Games table**

Modify `README.md` — current Games section:

```markdown
### 🎮 Games
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| [Memory Card Matching](src/modules/games/memory-card) | Flip cards two at a time to find all 8 emoji pairs. Beat your best move count! |
| [Typing Speed Test](src/modules/games/typing-speed-test) | Type a random passage as fast and accurately as you can in 60 seconds. Track your WPM and accuracy. |
| [Reaction Time Test](src/modules/games/reaction-time-test) | Wait for the screen to flash green, then tap as fast as you can. Track your best reaction time. |
| [Snake](src/modules/games/snake) | Steer a growing snake around the grid to eat pellets. Avoid the walls and your own tail — beat your high score. |
```

New Games section:

```markdown
### 🎮 Games
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| [Memory Card Matching](src/modules/games/memory-card) | Flip cards two at a time to find all 8 emoji pairs. Beat your best move count! |
| [Typing Speed Test](src/modules/games/typing-speed-test) | Type a random passage as fast and accurately as you can in 60 seconds. Track your WPM and accuracy. |
| [Reaction Time Test](src/modules/games/reaction-time-test) | Wait for the screen to flash green, then tap as fast as you can. Track your best reaction time. |
| [Snake](src/modules/games/snake) | Steer a growing snake around the grid to eat pellets. Avoid the walls and your own tail — beat your high score. |
| [Colour Sequence Memory](src/modules/games/colour-sequence-memory) | Watch the flashing colour sequence, then repeat it by tapping the tiles in order. Each round adds one more step — how long can you remember? |
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Colour Sequence Memory game to README"
```

---

## Final Verification

After all tasks are complete, run the full verification suite:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npx playwright test tests/e2e/colour-sequence-memory.spec.ts
```

All must pass before opening the PR.
