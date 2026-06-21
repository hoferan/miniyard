# Spec: Reaction Time Test

**Category:** games
**Date:** 2026-06-21
**Issue:** #78

## Function

A browser-based reaction time game. The screen starts dark with a "Wait for green…" prompt. After a random 1.5–4 second delay the screen flashes green; the player taps or clicks as fast as possible and their reaction time is shown in milliseconds. A history of the last 5 attempts and an all-time personal best (persisted in localStorage) track improvement.

---

## Inputs

| Input | Type | Validation |
|---|---|---|
| Player tap / click | Pointer / touch event | Ignored in `idle` phase; false start in `waiting`; recorded in `ready` |
| Random delay | `number` (ms) | Injected by `index.tsx` — uniform random 1500–4000 ms |
| Timestamp `now` | `number` (ms since epoch) | Injected via `Date.now()` — only called in `index.tsx`, never in `logic.ts` |

---

## Outputs

| Output | Description |
|---|---|
| Reaction time | ms elapsed between screen turning green and player clicking |
| History | Last 5 reaction times, newest first |
| Personal best | Lowest recorded reaction time across all sessions (localStorage) |
| Phase message | "Tap to start" / "Wait for green…" / "Click!" / "247 ms" |

---

## State Machine

```text
idle → waiting → ready → result
         ↑ (false start resets to idle)
```

### Phases

| Phase | Screen | Tap behaviour |
|---|---|---|
| `idle` | Dark, "Tap to Start" button | Button click → `waiting` |
| `waiting` | Dark, "Wait for green…" | False start → `idle` + message |
| `ready` | Green, "Click!" | Records reaction time → `result` |
| `result` | Dark, shows ms + history | "Try again" → `waiting` |

---

## Logic / Algorithm

```text
reaction time (ms) = clickTimestamp − readyAt
```

- `readyAt` is captured in `index.tsx` at the moment `triggerReady` is called (just before `setState`)
- History is capped at 5 entries (splice oldest when > 5)
- Personal best = `Math.min(current, stored)` — updated on every `result`

### Random delay

Generated in `index.tsx` only:

```ts
const delay = Math.floor(Math.random() * 2500) + 1500  // 1500–4000 ms
```

---

## Edge Cases

| Case | Behaviour |
|---|---|
| Click during `waiting` | False start → `idle`, show "Too early! Wait for green." for 1.5 s |
| Click during `idle` (outside button) | Ignored |
| localStorage unavailable | Personal best silently not persisted; game still works |
| Very fast click (< 100 ms) | Valid — displayed as-is, no floor applied |
| Very slow click (> 2000 ms) | Valid — displayed as-is, no ceiling applied |

---

## Data Model

```ts
type GamePhase = 'idle' | 'waiting' | 'ready' | 'result'

interface GameState {
  phase: GamePhase
  readyAt: number | null       // epoch ms when screen turned green
  reactionTime: number | null  // ms for last attempt
  history: number[]            // last 5 reaction times, newest first
  personalBest: number | null  // lowest ms ever recorded
}
```

---

## Pure Logic Functions (`logic.ts`)

| Function | Signature | Description |
|---|---|---|
| `createInitialState` | `(history, personalBest) → GameState` | Bootstrap state from localStorage values |
| `startWaiting` | `(state) → GameState` | `idle → waiting`, clears reactionTime |
| `triggerReady` | `(state, readyAt) → GameState` | `waiting → ready`, stores readyAt |
| `recordResult` | `(state, now) → GameState` | `ready → result`, calculates ms, updates history + personalBest |
| `handleFalseStart` | `(state) → GameState` | `waiting → idle`, clears timers (timer cleared by caller) |
| `resetToIdle` | `(state) → GameState` | `result → idle` |

Randomness and timestamps are never called inside `logic.ts` — always injected by `index.tsx`.

---

## New Files

```text
src/modules/games/reaction-time-test/meta.ts
src/modules/games/reaction-time-test/logic.ts
src/modules/games/reaction-time-test/logic.test.ts
src/modules/games/reaction-time-test/messages.ts
src/modules/games/reaction-time-test/index.tsx
tests/e2e/reaction-time-test.spec.ts
```

### Registration

```text
src/lib/registry.ts               — import + add reactionTimeTestMeta
src/app/games/[slug]/page.tsx     — add 'reaction-time-test' to componentMap
```

---

## UI Layout

- Full-screen clickable `<div>` (`min-h-[100dvh]`, `touch-action: none`)
- Background: `bg-zinc-900` (waiting/idle/result) → `bg-green-500` (ready)
- Center: phase message + result time (large, bold)
- Bottom panel: history list (last 5 as compact pills) + personal best badge
- "Tap to Start" button shown only in `idle` phase
- Whole screen is the tap target in `waiting` and `ready` phases

---

## localStorage Key

```text
reaction-time-test:personal-best
```

---

## Testing

### Unit tests (`logic.test.ts`)

- `createInitialState` returns correct phase and null fields
- `startWaiting` transitions `idle → waiting`
- `triggerReady` transitions `waiting → ready`, stores `readyAt`
- `recordResult` calculates correct ms, appends to history, caps at 5, updates personalBest
- `handleFalseStart` transitions `waiting → idle`
- `resetToIdle` transitions `result → idle`
- History capped at 5: oldest entry dropped when 6th is added
- Personal best only updated when new time is lower

### E2E (`tests/e2e/reaction-time-test.spec.ts`)

- Navigate to `/games/reaction-time-test`
- Click "Tap to Start"
- Wait for green screen
- Click immediately
- Assert reaction time is displayed in ms
- `page.screenshot()` for visual artifact
