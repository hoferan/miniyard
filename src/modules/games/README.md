# Games

## What belongs here

Browser-based mini games — simple, fun, mobile-first. Self-contained, no backend required.

## Examples

- Snake
- Memory Card Matching
- Reaction Time Test
- 2048
- Word Guess (Wordle-like)
- Brick Breaker
- Colour Sequence Memory
- Tap Rhythm Game

## What does NOT belong here

- Games requiring a backend, multiplayer, or saved progress
- Games that need user accounts or authentication
- Complex simulations — keep it "mini"

## Module structure

```text
src/modules/games/<name>/
  meta.ts           # Metadata: slug, title, description, tags, createdAt
  logic.ts          # Pure game logic — state transitions, win/lose, score
  logic.test.ts     # Vitest unit tests (no DOM, no React)
  index.tsx         # Game loop, rendering, event handling ('use client')
  messages.ts       # (optional) User-facing strings — only when the game has status/UI copy
```

## Brainstorm questions (Claude asks these before writing any code)

1. What is the game objective? How does the player win / lose?
2. How is it controlled? (touch, tap, swipe, keyboard?)
3. Are there points, a timer, or a high score?
4. How fast / slow is the pace? Does speed increase over time?
5. What difficulty levels exist, if any?
6. Does it fit comfortably on a small mobile screen?

## Conventions

- Game state is a plain serialisable object — no class instances
- Logic functions are pure: `(state, action) => newState`
- No side effects in `logic.ts` — randomness is injected, not called directly
- Touch events are primary; keyboard is secondary
- Tests cover state transitions, win condition, lose condition, and score calculation
