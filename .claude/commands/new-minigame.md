---
name: new-minigame
description: Starts the full workflow for a new minigame (Brainstorm → Spec → TDD → Implement → Register → Docs)
argument-hint: "[game name or brief idea]"
---

# /new-minigame

Starts Workflow A for a new **Minigame**.

## Flow

**Step 1 – Brainstorm**
Claude asks the following questions:
1. What is the game objective? How does the player win / lose?
2. How is it controlled? (touch, tap, keyboard, swipe?)
3. Are there points, a timer, or a high score?
4. How fast / slow is the game pace?
5. What difficulty levels are there (if any)?
6. Smartphone view: does the game fit a small display?

**Step 2 – Spec**
Claude summarises in writing: game objective, mechanics, state model, rendering approach.
Waits for confirmation.

**Step 3 – Tests first**
`src/modules/games/<name>/logic.test.ts` – game logic (state transitions, score calculation, win/lose conditions).
No DOM, no React in tests. Uses Vitest.

**Step 4 – Implementation**
1. `src/modules/games/<name>/meta.ts` → module metadata
2. `src/modules/games/<name>/logic.ts` → pure game logic, all tests green
3. `src/modules/games/<name>/index.tsx` → game loop, rendering, touch events, shadcn/ui
4. Register in `src/lib/registry.ts`
5. Add to `componentMap` in `src/app/games/[slug]/page.tsx`

**Step 5 – Documentation**
- Update README.md games list
- Comment controls in code if not obvious

**Step 6 – PR description**
Output finished PR description from template.
