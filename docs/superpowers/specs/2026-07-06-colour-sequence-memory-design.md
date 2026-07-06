# Design: Colour Sequence Memory

Category: games
Related issue: #125

## Objective

A Simon Says-style memory game. The game flashes a growing sequence of colored
tiles; the player repeats the sequence by tapping the tiles in order. Each
round appends one more step. There is no fixed win condition — it's an
endless high-score chase. The player loses by tapping the wrong tile in the
sequence.

## Layout

A 2x2 grid of 4 colored tiles (red, blue, green, yellow) — the classic Simon
layout. Chosen for simplicity and mobile fit.

## Architecture

Follows the same conventions as the existing `snake` module:

- `logic.ts` — pure functions operating on a plain serializable state object,
  no DOM/React, randomness injected as a parameter (like Snake's `placeFood`)
- `index.tsx` — client component (`'use client'`) that drives the flash
  animation, handles tap input, and renders dialogs
- `createHighScoreStore('color-sequence-memory:high-score')` — reuses the
  shared `src/lib/high-score.ts` utility for localStorage persistence

## Game state

```ts
type Phase = 'idle' | 'showing' | 'input' | 'gameover'

interface GameState {
  sequence: number[] // tile indices (0-3) chosen so far, in order
  inputIndex: number // how many correct taps made so far this round
  score: number // = sequence.length - 1 (rounds fully cleared)
  phase: Phase
}
```

## Flow

1. `idle` — start dialog is shown (matches Snake's start dialog pattern).
2. `startGame(state, random)` — appends the first random tile to `sequence`,
   sets `phase` to `showing`.
3. `showing` — `index.tsx` animates flashing each tile in `sequence` in
   order, using `getFlashIntervalMs(round)` for timing (faster as the
   sequence grows, floor-clamped like Snake's `getTickIntervalMs`). When
   playback finishes, `phase` transitions to `input`.
4. `input` — the player taps tiles. `submitTap(state, tileIndex)`:
   - if the tap matches `sequence[inputIndex]`: increment `inputIndex`
     - if `inputIndex === sequence.length`: round complete — append a new
       random tile to `sequence`, reset `inputIndex` to `0`, `phase` back to
       `showing`
   - if the tap does not match: `phase` transitions to `gameover`
5. `gameover` — dialog shows the final score (`sequence.length - 1`), updates
   the persisted high score if improved, and offers "Play Again" which resets
   to a fresh `idle` state.

## Logic functions (pure, in `logic.ts`)

- `createInitialState(): GameState`
- `startGame(state: GameState, random: () => number = Math.random): GameState`
- `submitTap(state: GameState, tileIndex: number): GameState`
- `getFlashIntervalMs(round: number): number` — decreasing interval as
  `round` grows, floor-clamped to a minimum

## UI (`index.tsx`)

- 2x2 grid of 4 colored tiles, aspect-square (matches Snake's board sizing)
- Each tile highlights briefly during sequence playback, and briefly on
  successful tap
- Score / best score header, same layout as Snake
- Start dialog and game-over dialog, reusing the existing `Dialog` UI
  components
- Taps are ignored while `phase !== 'input'` (prevents input during
  playback, and after game over/before restart)
- Touch/click is the only control — no keyboard requirement, per the issue

## Edge cases

- Rapid taps during `showing` phase are ignored (phase guard in
  `submitTap`, and the UI additionally disables tile buttons during
  playback)
- Taps during `idle` or `gameover` are ignored
- `localStorage` unavailable — `createHighScoreStore` already falls back to
  `null`/no-op persistence, no changes needed

## Testing

**Unit tests (`logic.test.ts`):**

- `createInitialState` returns a valid idle state
- `startGame` appends one tile and transitions to `showing`
- `submitTap` progressing correctly through a round (increments
  `inputIndex`)
- `submitTap` completing a round (appends new tile, resets `inputIndex`,
  phase back to `showing`, score increments)
- `submitTap` with a wrong tile transitions to `gameover`
- `submitTap` while not in `input` phase is a no-op
- `getFlashIntervalMs` decreases with round number and is floor-clamped

**E2E test (`tests/e2e/colour-sequence-memory.spec.ts`):**

- Drives a full round: start the game, wait for the flash sequence, tap the
  correct tile, verify score increments; includes a `page.screenshot()` for
  a visual artifact

## New files

```text
src/modules/games/colour-sequence-memory/meta.ts
src/modules/games/colour-sequence-memory/logic.ts
src/modules/games/colour-sequence-memory/logic.test.ts
src/modules/games/colour-sequence-memory/index.tsx
src/modules/games/colour-sequence-memory/messages.ts
tests/e2e/colour-sequence-memory.spec.ts
```

## Registration

- `src/lib/registry.ts`
- `src/components/games-module-content.tsx` (componentMap)
