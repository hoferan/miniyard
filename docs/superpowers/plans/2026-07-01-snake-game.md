# Snake Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Snake" game module to `src/modules/games/snake/` — a classic Snake game on a 16×16 grid with keyboard + swipe controls, speed-up every 5 pellets, and a localStorage high score.

**Architecture:** Pure game-state logic (`logic.ts`) with no DOM/React dependencies, driven by a `'use client'` React component (`index.tsx`) that renders a CSS grid of divs, runs a `setInterval` game loop, and wires up keyboard (`keydown`) and touch (`touchstart`/`touchend`) input. Follows the same structure as the existing `memory-card` module (idle/playing/gameover phases, Dialog overlays, `createHighScoreStore`).

**Tech Stack:** Next.js 14 (App Router), React, TypeScript strict, Tailwind CSS, shadcn/ui (`Dialog`, `Button`), lucide-react (`Worm`, `Trophy`), Vitest, Playwright.

## Global Constraints

- TypeScript strict mode — no `any`
- Functional components only, `'use client'` only where interactivity/hooks/browser APIs are needed
- No inline styles — Tailwind utility classes only (one exception: `gridTemplateColumns` must be set via the `style` prop since Tailwind has no arbitrary-column-count utility for a 16-column grid — this is a layout value, not a style choice, so it is acceptable)
- Logic (`logic.ts`) is pure — no React import, no `Math.random()` calls except as an injected default parameter
- User-facing strings live in `messages.ts`; `logic.ts` stays string-free
- Grid size: 16×16 (`GRID_SIZE = 16`)
- Speed: `200ms` base tick interval, `-15ms` per 5 pellets eaten, floor `80ms`
- High score persisted under localStorage key `snake:high-score` via `createHighScoreStore` (`src/lib/high-score.ts`, already exists — do not modify)
- 180° direction reversal into the snake's own neck must be ignored, not fatal
- Commits use Conventional Commits (`feat:`, `test:`, etc.)

---

### Task 1: Module metadata + icon registration

**Files:**
- Create: `src/modules/games/snake/meta.ts`
- Modify: `src/lib/icons.ts`

**Interfaces:**
- Produces: `snakeMeta: Module` (from `@/lib/types`), consumed by Task 5 (`registry.ts`)
- Produces: `ICON_MAP['worm']` entry, consumed by any UI that renders `mod.icon`

- [ ] **Step 1: Create the metadata file**

```ts
// src/modules/games/snake/meta.ts
import { Module } from '@/lib/types'

export const snakeMeta: Module = {
  slug: 'snake',
  title: 'Snake',
  description:
    'Steer a growing snake around the grid to eat pellets. Avoid the walls and your own tail — beat your high score.',
  category: 'games',
  tags: ['snake', 'arcade', 'grid'],
  createdAt: '2026-07-01',
  icon: 'worm',
}
```

- [ ] **Step 2: Add the `worm` icon to the icon map**

Modify `src/lib/icons.ts` — current content:

```ts
import { Ruler, Code2, ShieldCheck, LayoutGrid, Keyboard, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  'ruler': Ruler,
  'code-2': Code2,
  'shield-check': ShieldCheck,
  'layout-grid': LayoutGrid,
  'keyboard': Keyboard,
  'zap': Zap,
}
```

New content:

```ts
import { Ruler, Code2, ShieldCheck, LayoutGrid, Keyboard, Zap, Worm } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  'ruler': Ruler,
  'code-2': Code2,
  'shield-check': ShieldCheck,
  'layout-grid': LayoutGrid,
  'keyboard': Keyboard,
  'zap': Zap,
  'worm': Worm,
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/modules/games/snake/meta.ts src/lib/icons.ts
git commit -m "feat: add Snake module metadata and icon"
```

---

### Task 2: Game logic (`logic.ts`) with unit tests

**Files:**
- Create: `src/modules/games/snake/logic.test.ts`
- Create: `src/modules/games/snake/logic.ts`

**Interfaces:**
- Produces (consumed by Task 4 `index.tsx`):
  - `GRID_SIZE: number`
  - `type Direction = 'up' | 'down' | 'left' | 'right'`
  - `type GamePhase = 'idle' | 'playing' | 'gameover'`
  - `interface Cell { x: number; y: number }`
  - `interface GameState { snake: Cell[]; direction: Direction; food: Cell; score: number; phase: GamePhase }`
  - `createInitialState(random?: () => number): GameState`
  - `startGame(state: GameState): GameState`
  - `changeDirection(state: GameState, direction: Direction): GameState`
  - `tick(state: GameState, random?: () => number): GameState`
  - `getTickIntervalMs(score: number): number`
  - `placeFood(snakeCells: Cell[], gridSize: number, random?: () => number): Cell`

- [ ] **Step 1: Write the failing test file**

```ts
// src/modules/games/snake/logic.test.ts
import { describe, it, expect } from 'vitest'
import {
  GRID_SIZE,
  createInitialState,
  startGame,
  changeDirection,
  tick,
  getTickIntervalMs,
  placeFood,
  type Cell,
} from './logic'

describe('createInitialState', () => {
  it('creates a snake of length 3, centered, facing right', () => {
    const state = createInitialState()
    const center = Math.floor(GRID_SIZE / 2)
    expect(state.snake).toEqual([
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ])
    expect(state.direction).toBe('right')
  })

  it('starts in idle phase with zero score', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.score).toBe(0)
  })

  it('places food on a cell not occupied by the snake', () => {
    const state = createInitialState()
    const onSnake = state.snake.some((c) => c.x === state.food.x && c.y === state.food.y)
    expect(onSnake).toBe(false)
  })
})

describe('startGame', () => {
  it('transitions idle to playing', () => {
    const state = createInitialState()
    expect(startGame(state).phase).toBe('playing')
  })

  it('does nothing if already playing', () => {
    const state = startGame(createInitialState())
    expect(startGame(state)).toEqual(state)
  })
})

describe('changeDirection', () => {
  it('updates direction for a valid turn while playing', () => {
    const state = startGame(createInitialState())
    const next = changeDirection(state, 'up')
    expect(next.direction).toBe('up')
  })

  it('ignores a 180 degree reversal', () => {
    const state = startGame(createInitialState())
    const next = changeDirection(state, 'left')
    expect(next.direction).toBe('right')
  })

  it('is ignored while idle', () => {
    const state = createInitialState()
    const next = changeDirection(state, 'up')
    expect(next.direction).toBe('right')
  })

  it('is ignored after game over', () => {
    const playing = startGame(createInitialState())
    const state = { ...playing, phase: 'gameover' as const }
    const next = changeDirection(state, 'up')
    expect(next.direction).toBe('right')
  })
})

describe('tick', () => {
  it('moves the snake one cell forward without growing when no food is eaten', () => {
    const center = Math.floor(GRID_SIZE / 2)
    const state = { ...startGame(createInitialState()), food: { x: 0, y: 0 } }
    const next = tick(state)
    expect(next.snake[0]).toEqual({ x: center + 1, y: center })
    expect(next.snake).toHaveLength(3)
    expect(next.score).toBe(0)
  })

  it('grows the snake and increments score when food is eaten', () => {
    const playing = startGame(createInitialState())
    const head = playing.snake[0]
    const state = { ...playing, food: { x: head.x + 1, y: head.y } }
    const next = tick(state, () => 0.5)
    expect(next.snake).toHaveLength(4)
    expect(next.score).toBe(1)
    const onSnake = next.snake.some((c) => c.x === next.food.x && c.y === next.food.y)
    expect(onSnake).toBe(false)
  })

  it('ends the game when the snake hits the right wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: GRID_SIZE - 1, y: 5 },
      { x: GRID_SIZE - 2, y: 5 },
      { x: GRID_SIZE - 3, y: 5 },
    ]
    const state = { ...playing, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits the left wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }]
    const state = { ...playing, direction: 'left' as const, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits the top wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }]
    const state = { ...playing, direction: 'up' as const, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits the bottom wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: 5, y: GRID_SIZE - 1 },
      { x: 5, y: GRID_SIZE - 2 },
      { x: 5, y: GRID_SIZE - 3 },
    ]
    const state = { ...playing, direction: 'down' as const, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits its own body', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
      { x: 5, y: 4 },
    ]
    const state = { ...playing, direction: 'right' as const, snake, food: { x: 15, y: 15 } }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('does not falsely trigger self collision on the cell the tail is vacating', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 6, y: 5 },
    ]
    const state = { ...playing, direction: 'right' as const, snake, food: { x: 15, y: 15 } }
    const next = tick(state)
    expect(next.phase).toBe('playing')
  })

  it('does not change state when not playing', () => {
    const state = createInitialState()
    const next = tick(state)
    expect(next).toEqual(state)
  })
})

describe('getTickIntervalMs', () => {
  it('returns 200 at score 0', () => {
    expect(getTickIntervalMs(0)).toBe(200)
  })

  it('decreases by 15 every 5 pellets', () => {
    expect(getTickIntervalMs(5)).toBe(185)
    expect(getTickIntervalMs(10)).toBe(170)
  })

  it('floors at 80', () => {
    expect(getTickIntervalMs(1000)).toBe(80)
  })
})

describe('placeFood', () => {
  it('never returns a cell occupied by the snake', () => {
    const snake: Cell[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }]
    for (let i = 0; i < 20; i++) {
      const food = placeFood(snake, 2, () => i / 20)
      const onSnake = snake.some((c) => c.x === food.x && c.y === food.y)
      expect(onSnake).toBe(false)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/modules/games/snake/logic.test.ts`
Expected: FAIL — `Cannot find module './logic'` (file does not exist yet)

- [ ] **Step 3: Write the implementation**

```ts
// src/modules/games/snake/logic.ts
export const GRID_SIZE = 16

export type Direction = 'up' | 'down' | 'left' | 'right'
export type GamePhase = 'idle' | 'playing' | 'gameover'

export interface Cell {
  x: number
  y: number
}

export interface GameState {
  snake: Cell[]
  direction: Direction
  food: Cell
  score: number
  phase: GamePhase
}

const DIRECTION_VECTORS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

export function placeFood(
  snakeCells: Cell[],
  gridSize: number,
  random: () => number = Math.random
): Cell {
  const occupied = new Set(snakeCells.map((c) => `${c.x},${c.y}`))
  const emptyCells: Cell[] = []
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) emptyCells.push({ x, y })
    }
  }
  const index = Math.floor(random() * emptyCells.length)
  return emptyCells[index]
}

export function getTickIntervalMs(score: number): number {
  const interval = 200 - Math.floor(score / 5) * 15
  return Math.max(interval, 80)
}

export function createInitialState(random: () => number = Math.random): GameState {
  const center = Math.floor(GRID_SIZE / 2)
  const snake: Cell[] = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ]
  return {
    snake,
    direction: 'right',
    food: placeFood(snake, GRID_SIZE, random),
    score: 0,
    phase: 'idle',
  }
}

export function startGame(state: GameState): GameState {
  if (state.phase !== 'idle') return state
  return { ...state, phase: 'playing' }
}

export function changeDirection(state: GameState, direction: Direction): GameState {
  if (state.phase !== 'playing') return state
  if (OPPOSITE_DIRECTION[state.direction] === direction) return state
  return { ...state, direction }
}

export function tick(state: GameState, random: () => number = Math.random): GameState {
  if (state.phase !== 'playing') return state

  const vector = DIRECTION_VECTORS[state.direction]
  const head = state.snake[0]
  const newHead: Cell = { x: head.x + vector.x, y: head.y + vector.y }

  const hitWall =
    newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE
  if (hitWall) {
    return { ...state, phase: 'gameover' }
  }

  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1)
  const hitSelf = bodyToCheck.some((cell) => cell.x === newHead.x && cell.y === newHead.y)
  if (hitSelf) {
    return { ...state, phase: 'gameover' }
  }

  if (!ateFood) {
    return { ...state, snake: [newHead, ...state.snake.slice(0, -1)] }
  }

  const newSnake = [newHead, ...state.snake]
  return {
    ...state,
    snake: newSnake,
    score: state.score + 1,
    food: placeFood(newSnake, GRID_SIZE, random),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/modules/games/snake/logic.test.ts`
Expected: PASS (all tests green)

- [ ] **Step 5: Commit**

```bash
git add src/modules/games/snake/logic.ts src/modules/games/snake/logic.test.ts
git commit -m "test: add Snake game logic with unit tests"
```

---

### Task 3: User-facing strings (`messages.ts`)

**Files:**
- Create: `src/modules/games/snake/messages.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `MESSAGES` object, consumed by Task 4 (`index.tsx`)

- [ ] **Step 1: Create the messages file**

```ts
// src/modules/games/snake/messages.ts
export const MESSAGES = {
  scoreLabel: 'Score:',
  bestLabel: 'Best:',
  startTitle: 'Snake',
  startDescription:
    'Use arrow keys or swipe to steer. Eat pellets to grow — avoid walls and your own tail.',
  startButton: 'Start',
  newGame: 'New Game',
  gameOverTitle: 'Game Over',
  gameOverSummary: (score: number) => `You scored ${score}.`,
  newBest: 'New best score!',
  playAgain: 'Play again',
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/games/snake/messages.ts
git commit -m "feat: add Snake game user-facing strings"
```

---

### Task 4: Game UI component (`index.tsx`)

**Files:**
- Create: `src/modules/games/snake/index.tsx`

**Interfaces:**
- Consumes from `./logic`: `GRID_SIZE`, `type Direction`, `type GameState`, `createInitialState`, `startGame`, `changeDirection`, `tick`, `getTickIntervalMs`
- Consumes from `./messages`: `MESSAGES`
- Consumes from `@/lib/high-score`: `createHighScoreStore`
- Consumes from `@/lib/utils`: `cn`
- Consumes from `@/components/ui/button`: `Button`
- Consumes from `@/components/ui/dialog`: `Dialog`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle`
- Produces: default export React component, consumed by Task 5 (`games-module-content.tsx` dynamic import)

- [ ] **Step 1: Create the component**

```tsx
// src/modules/games/snake/index.tsx
'use client'

import { useState, useEffect, useCallback, useRef, type TouchEvent } from 'react'
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
  GRID_SIZE,
  type Direction,
  type GameState,
  createInitialState,
  startGame,
  changeDirection,
  tick,
  getTickIntervalMs,
} from './logic'
import { MESSAGES } from './messages'
import { createHighScoreStore } from '@/lib/high-score'

const bestScoreStore = createHighScoreStore('snake:high-score')

const SWIPE_THRESHOLD_PX = 20

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export default function Snake() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setBestScore(bestScoreStore.load())
  }, [])

  useEffect(() => {
    if (state.phase !== 'playing') return
    const intervalMs = getTickIntervalMs(state.score)
    const id = setInterval(() => {
      setState((prev) => tick(prev))
    }, intervalMs)
    return () => clearInterval(id)
  }, [state.phase, state.score])

  useEffect(() => {
    if (state.phase === 'gameover') {
      const prev = bestScoreStore.load()
      const improved = prev === null || state.score > prev
      if (improved) bestScoreStore.save(state.score)
      setBestScore(improved ? state.score : prev)
      setIsNewBest(improved)
    }
  }, [state.phase, state.score])

  const handleDirection = useCallback((direction: Direction) => {
    setState((prev) => {
      if (prev.phase === 'idle') return changeDirection(startGame(prev), direction)
      return changeDirection(prev, direction)
    })
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const direction = KEY_DIRECTIONS[e.key]
      if (!direction) return
      e.preventDefault()
      handleDirection(direction)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleDirection])

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current
      touchStartRef.current = null
      if (!start) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) return
      const direction: Direction =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
      handleDirection(direction)
    },
    [handleDirection]
  )

  const handleNewGame = useCallback(() => {
    setState(createInitialState())
    setIsNewBest(false)
  }, [])

  const snakeCellSet = new Set(state.snake.map((c) => `${c.x},${c.y}`))
  const headKey = `${state.snake[0].x},${state.snake[0].y}`

  return (
    <main className="max-w-md mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">
          {MESSAGES.scoreLabel} <span className="font-bold text-foreground">{state.score}</span>
        </span>
        {bestScore !== null && (
          <span className="text-muted-foreground">
            {MESSAGES.bestLabel} <span className="font-bold text-foreground">{bestScore}</span>
          </span>
        )}
      </div>

      <div
        role="img"
        aria-label="Snake game board"
        className="grid gap-px bg-border aspect-square select-none touch-none rounded-lg overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE
          const y = Math.floor(index / GRID_SIZE)
          const key = `${x},${y}`
          const isHead = key === headKey
          const isSnake = snakeCellSet.has(key)
          const isFood = state.food.x === x && state.food.y === y
          return (
            <div
              key={key}
              className={cn(
                'aspect-square bg-background',
                isSnake && !isHead && 'bg-primary/70',
                isHead && 'bg-primary',
                isFood && 'bg-green-500'
              )}
            />
          )
        })}
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={handleNewGame} variant="outline">
          {MESSAGES.newGame}
        </Button>
      </div>

      <Dialog open={state.phase === 'idle'} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
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
git add src/modules/games/snake/index.tsx
git commit -m "feat: add Snake game UI component"
```

---

### Task 5: Register the module

**Files:**
- Modify: `src/lib/registry.ts`
- Modify: `src/components/games-module-content.tsx`

**Interfaces:**
- Consumes: `snakeMeta` from Task 1, default export from Task 4
- Produces: `/games/snake` route resolves via `getModuleBySlug('snake')` and `GamesModuleContent`

- [ ] **Step 1: Add the module to the registry**

Modify `src/lib/registry.ts` — current content:

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

New content:

```ts
import { Module, ModuleCategory } from './types'
import { unitConverterMeta } from '@/modules/utilities/unit-converter/meta'
import { base64ConverterMeta } from '@/modules/utilities/base64-converter/meta'
import { passwordStrengthCheckerMeta } from '@/modules/utilities/password-strength-checker/meta'
import { memoryCardMeta } from '@/modules/games/memory-card/meta'
import { typingSpeedTestMeta } from '@/modules/games/typing-speed-test/meta'
import { reactionTimeTestMeta } from '@/modules/games/reaction-time-test/meta'
import { snakeMeta } from '@/modules/games/snake/meta'

export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, passwordStrengthCheckerMeta, memoryCardMeta, typingSpeedTestMeta, reactionTimeTestMeta, snakeMeta]

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
}

export function GamesModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds, `/games/snake` route generated

- [ ] **Step 4: Commit**

```bash
git add src/lib/registry.ts src/components/games-module-content.tsx
git commit -m "feat: register Snake game module"
```

---

### Task 6: E2E test

**Files:**
- Create: `tests/e2e/snake.spec.ts`

**Interfaces:**
- Consumes: the running app at `/games/snake` (registered in Task 5)

- [ ] **Step 1: Write the E2E test**

```ts
// tests/e2e/snake.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Snake', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/snake')
  })

  test('loads with a Start button in the idle overlay', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
    await page.screenshot({ path: 'test-results/snake-idle.png' })
  })

  test('starts the game and hides the idle overlay', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeHidden()
    await page.keyboard.press('ArrowUp')
    await expect(page.getByText('Score:')).toBeVisible()
    await page.screenshot({ path: 'test-results/snake-playing.png' })
  })
})
```

- [ ] **Step 2: Run the E2E test**

Run: `npx playwright test tests/e2e/snake.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 3: Review the screenshots**

Open `test-results/snake-idle.png` and `test-results/snake-playing.png` and confirm the board and idle/game-over overlays render correctly.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/snake.spec.ts
git commit -m "test: add Snake game E2E test"
```

---

### Task 7: Update documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing

- [ ] **Step 1: Add Snake to the Games table**

Modify `README.md` — current Games section:

```markdown
### 🎮 Games
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| [Memory Card Matching](src/modules/games/memory-card) | Flip cards two at a time to find all 8 emoji pairs. Beat your best move count! |
| [Typing Speed Test](src/modules/games/typing-speed-test) | Type a random passage as fast and accurately as you can in 60 seconds. Track your WPM and accuracy. |
| [Reaction Time Test](src/modules/games/reaction-time-test) | Wait for the screen to flash green, then tap as fast as you can. Track your best reaction time. |
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Snake game to README"
```

---

## Final Verification

After all tasks are complete, run the full verification suite:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npx playwright test tests/e2e/snake.spec.ts
```

All must pass before opening the PR.
