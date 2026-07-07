# Spec: Snake

**Category:** games
**Date:** 2026-07-01
**Issue:** #79

## Function

Classic Snake. The player steers a growing snake around a fixed 16×16 grid to eat food pellets. Each pellet eaten grows the snake by one cell and increments the score. The game ends when the snake's head hits a wall or its own body. Speed increases every 5 pellets eaten.

---

## Inputs

| Input | Type | Validation |
|---|---|---|
| Arrow key press (desktop) | `KeyboardEvent` | Only `ArrowUp/Down/Left/Right` handled; ignored during `idle`/`gameover`; 180° reversal into own neck ignored |
| Swipe gesture (mobile) | `TouchEvent` (`touchstart`/`touchend`) | Delta below a minimum distance threshold ignored (not a swipe); nearest cardinal direction taken from the larger of dx/dy |
| Tick (game loop) | none (interval callback) | Fires every `tickIntervalMs`; only advances state when `phase === 'playing'` |
| Random (food placement) | `() => number` | Injected — never called directly inside `logic.ts` |

---

## Outputs

| Output | Description |
|---|---|
| Score | Number of pellets eaten in the current run |
| High score | Best score across all sessions, persisted in `localStorage` |
| Board | 16×16 grid rendering snake body, head, food, and empty cells |
| Game-over overlay | Shows final score, high score, "new best" flag, and "Play Again" button |

---

## Logic / Algorithm

### Data Model

```ts
type Direction = 'up' | 'down' | 'left' | 'right'
type GamePhase = 'idle' | 'playing' | 'gameover'

interface Cell {
  x: number
  y: number
}

interface GameState {
  snake: Cell[]        // head first
  direction: Direction
  food: Cell
  score: number
  phase: GamePhase
}
```

### Board

- Fixed grid: `GRID_SIZE = 16` (16×16 cells)
- Initial snake: length 3, centered on the grid, facing `right`, head at the center cell

### Pure Logic Functions (`logic.ts`)

| Function | Signature | Description |
|---|---|---|
| `createInitialState` | `(random) → GameState` | Snake length 3, centered, facing right; `phase: 'idle'`; places first food |
| `startGame` | `(state) → GameState` | `idle → playing` (no other field changes) |
| `changeDirection` | `(state, dir) → GameState` | Updates `direction` unless `dir` is a 180° reversal of the current direction, or `phase !== 'playing'` |
| `tick` | `(state, random) → GameState` | Moves snake one cell in `direction`; detects wall/self collision → `phase: 'gameover'`; detects food eaten → grows snake, `score++`, places new food via `placeFood` |
| `getTickIntervalMs` | `(score) → number` | `200 - Math.floor(score / 5) * 15`, floored at `80` |
| `placeFood` | `(snakeCells, gridSize, random) → Cell` | Picks a uniformly random empty cell (retries until a cell not occupied by the snake is found) |

Randomness is always injected — `logic.ts` never calls `Math.random()` directly.

### Movement & Collision

- Moving: new head = current head + direction vector; if food not eaten, tail cell is removed (snake stays same length); if food eaten, tail is kept (snake grows by 1)
- Wall collision: new head `x`/`y` outside `[0, GRID_SIZE - 1]` → `gameover`
- Self collision: new head position matches any existing body cell (excluding the tail cell that is about to be removed, since that cell vacates on this move) → `gameover`

### Speed

| Score | Tick interval |
|---|---|
| 0–4 | 200 ms |
| 5–9 | 185 ms |
| 10–14 | 170 ms |
| ... | ... |
| ≥ 40 | 80 ms (floor) |

---

## Edge Cases

| Case | Behaviour |
|---|---|
| Rapid opposite-direction key press (e.g. right → left while moving right) | Ignored — direction unchanged, no instant death from reversal |
| Food spawns on a snake cell | Prevented — `placeFood` only returns empty cells |
| Snake grows to fill the entire board | Theoretical max length 256 (16×16); `placeFood` has no empty cell left to return in this case, but this is unreachable in practice and not handled specially |
| Player presses a direction key before starting | Ignored while `phase === 'idle'`; first arrow key/swipe transitions `idle → playing` and also applies that direction |
| Score crosses a 5-pellet threshold | Game loop interval is restarted with the new `tickIntervalMs` on the next render |
| localStorage unavailable | High score silently not persisted; game still works (`createHighScoreStore` already handles this) |

---

## New Files

```text
src/modules/games/snake/meta.ts
src/modules/games/snake/logic.ts
src/modules/games/snake/logic.test.ts
src/modules/games/snake/messages.ts
src/modules/games/snake/index.tsx
tests/e2e/snake.spec.ts
```

### Registration

```text
src/lib/registry.ts                        — import + add snakeMeta
src/components/games-module-content.tsx    — add 'snake' to componentMap
```

---

## UI Layout (`index.tsx`)

- `'use client'`, CSS grid of divs (16×16, `aspect-square` container), Tailwind-only styling — no canvas
- Score and high score shown above the board (`createHighScoreStore('snake:high-score')`)
- Idle overlay (Dialog, matches `memory-card` pattern): "Start" button; pressing any arrow key or swiping also starts the game
- Game loop: `setInterval(tick, tickIntervalMs)`, restarted whenever `tickIntervalMs` changes
- Keyboard: `keydown` listener → `changeDirection`
- Touch: `touchstart`/`touchend` delta → nearest cardinal direction → `changeDirection`
- Game-over overlay (Dialog): final score, high score, "new best" badge if beaten, "Play Again" button that calls `createInitialState` again

---

## localStorage Key

```text
snake:high-score
```

---

## Testing

### Unit tests (`logic.test.ts`)

- `createInitialState` returns snake of length 3, centered, facing right, `phase: 'idle'`, food not on a snake cell
- `startGame` transitions `idle → playing`
- `changeDirection` updates direction for valid turns
- `changeDirection` ignores 180° reversal (e.g. moving right, pressing left)
- `changeDirection` ignored when `phase !== 'playing'`
- `tick` moves the snake one cell in the current direction without growing when no food eaten
- `tick` grows the snake and increments score when food is eaten, and places new food not on the snake
- `tick` ends the game (`phase: 'gameover'`) on wall collision (all four walls)
- `tick` ends the game on self collision
- `tick` does not falsely trigger self collision on the cell the tail is vacating
- `getTickIntervalMs` returns 200 at score 0, decreases every 5 pellets, floors at 80
- `placeFood` never returns a cell occupied by the snake

### E2E (`tests/e2e/snake.spec.ts`)

- Navigate to `/games/snake`
- Assert idle overlay with "Start" button is visible
- Click "Start"
- Press an arrow key and assert the game is running (idle overlay gone)
- `page.screenshot()` for visual artifact
