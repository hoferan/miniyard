# miniyard – Claude Code Instructions

## Project Overview

**miniyard** is a modular playground application with three categories:

| Category | Description | Path |
|---|---|---|
| **Utility Tools** | Calculators, converters, text tools, math functions | `src/tools/` |
| **Minigames** | Browser games, mobile-first | `src/games/` |
| **API Explorers** | Hands-on demos with public APIs | `src/explorers/` |

Solo developer. Learning and showcase project.

### Stack
- **Framework:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Testing:** Jest + React Testing Library
- **Hosting:** Netlify with PR Preview Deployments
- **Error Tracking:** Sentry
- **Code Review:** CodeRabbit (automatic on every PR)
- **Dependencies:** Dependabot (weekly, Monday)

### Branch Strategy
`main` only. **No direct push.** Every change via PR.

---

## Project Structure

```
src/
  app/                        # Next.js App Router Pages & Layouts
  components/                 # Shared UI components
  tools/
    <tool-name>/
      index.tsx               # React UI component
      logic.ts                # Pure logic – no React, no DOM
      logic.test.ts           # Tests for logic.ts (TDD)
  games/
    <game-name>/
      index.tsx
      logic.ts
      logic.test.ts
  explorers/
    <api-name>/
      index.tsx
      api.ts                  # API calls, fetching
      api.test.ts
  lib/                        # Shared utilities & helpers
docs/
  tools/                      # Per-tool documentation (optional)
  adr/                        # Architecture Decision Records (optional)
```

**Golden rule:** Logic (`logic.ts`) is always separated from UI (`index.tsx`). Pure functions, easy to test, no React import.

---

## Workflow Decision Tree

```
New task received
       │
       ├─ New tool / minigame / API explorer?
       │         └─ YES → Workflow A (Brainstorm → Spec → TDD → Implement → Docs → Review)
       │
       ├─ Bug fix?
       │         └─ YES → Workflow B (Analyse → Fix → Test → PR)
       │
       ├─ UI adjustment / styling?
       │         └─ YES → Workflow C (Direct → PR)
       │
       └─ Refactor / cleanup?
                 └─ YES → Workflow C (Change, keep tests green → PR)
```

---

## Workflow A: New Tool / Feature (mandatory)

### Step 1 – Brainstorm
**Before writing any line of code**, Claude actively asks questions:
- What exactly should the tool do? What should it not do?
- What are the inputs, what are the outputs?
- What edge cases (0, negative, empty, invalid)?
- Mobile-first: How does the user interact on a smartphone?
- Are there similar tools in the project that can be reused?

Claude waits for answers. No assumptions.

### Step 2 – Spec (confirm in writing)
Claude summarises the requirements and waits for confirmation:

```
## Spec: [Tool Name]
Category: [Utility / Minigame / API Explorer]
Function: [1–2 sentences]
Inputs: [list with type and validation]
Outputs: [list]
Logic / Algorithm: [core formula or flow]
Edge Cases: [list]
New files:
  - src/[tools|games|explorers]/[name]/logic.ts
  - src/[tools|games|explorers]/[name]/logic.test.ts
  - src/[tools|games|explorers]/[name]/index.tsx
Documentation:
  - README.md update (tool list)
  - docs/tools/[name].md if complex
```

**No implementation without explicit spec confirmation.**

### Step 3 – Tests first (TDD, non-negotiable)
Claude writes `logic.test.ts` completely **before** `logic.ts` exists:
- Happy path (normal case)
- Edge cases (0, negative, empty string, null/undefined)
- Error cases / invalid inputs
- Boundary values

Tests are **red** – that is correct and intentional.

### Step 4 – Implementation
Implement `logic.ts` until all tests are green.
Then `index.tsx`: Tailwind, mobile-first, no inline styles.

### Step 5 – Update documentation (mandatory)
After every implementation:
- **`README.md`**: Add tool/minigame/explorer to the appropriate list
- **`docs/tools/<name>.md`**: Only for complex logic or external APIs
- Code comments if the logic is not self-explanatory

### Step 6 – Review checklist
Claude checks before the PR:
- [ ] All tests green (`npm test`)
- [ ] No hardcoded values in `logic.ts`
- [ ] No unnecessary npm packages
- [ ] Sentry error boundary for external calls
- [ ] Mobile view works (Tailwind responsive)
- [ ] README and docs up to date

---

## Workflow B: Bug Fix

1. Read the affected file, **name the root cause** before fixing
2. If `logic.ts` is affected: write a failing test for the bug, **then** fix it
3. Minimal fix – no unnecessary changes to other files
4. PR description: cause + fix + affected tests

---

## Workflow C: Direct Change (styling, config, docs)

No spec needed. Change directly, create PR, short description.

---

## Documentation Rules (always follow)

| What changed? | What to update? |
|---|---|
| New tool / game / explorer | README.md tool list + `docs/tools/` if needed |
| New ENV variable | README.md setup section |
| New npm dependency | README.md tech stack if relevant |
| Breaking change to structure | Code comment + README |
| Complex API integration | `docs/tools/<name>.md` |

Claude **always** checks whether documentation needs updating – without explicit prompt.

---

## Conventions

- **Commits:** Conventional Commits – `feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`
- **Language:** Everything in English – code, comments, documentation, commit messages, PR descriptions, Claude responses, and all repo content. This applies even when the user communicates in German.
- **Components:** Functional components, hooks, no class-based React
- **Logic:** Always extracted to `logic.ts` – pure functions, no side effects
- **Styling:** Tailwind utility classes, no inline CSS, no separate CSS except `globals.css`
- **Error handling:** `Sentry.captureException()` for unexpected errors and API calls
- **Secrets:** Only via `.env.local` (local) / Netlify Environment Variables (prod)

---

## Prohibitions (never, under any circumstances)

- ❌ Direct push to `main`
- ❌ Implementation without confirmed spec (for new features)
- ❌ Skipping, disabling, or commenting out tests
- ❌ Touching `.env` files or logging their contents
- ❌ New npm packages without a brief justification
- ❌ Removing or disabling Sentry
- ❌ Not updating documentation after a change
- ❌ Writing anything in the repository in a language other than English
