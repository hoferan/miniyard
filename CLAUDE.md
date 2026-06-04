# miniyard – Claude Code Instructions

## Project Overview

**miniyard** is a modular playground platform with four categories:

| Category | Description | Path |
|---|---|---|
| **Utilities** | Calculators, converters, text tools, math functions | `src/modules/utilities/` |
| **Games** | Browser games, mobile-first | `src/modules/games/` |
| **API Explorers** | Hands-on demos with public APIs | `src/modules/apis/` |
| **Swiss** | Tools and references for Switzerland | `src/modules/swiss/` |

Solo developer. Learning and showcase project.

### Stack
- **Framework:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Components:** shadcn/ui
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Hosting:** Netlify with PR Preview Deployments
- **Error Tracking:** Sentry
- **Code Review:** CodeRabbit (automatic on every PR)
- **Dependencies:** Dependabot (weekly, Monday)
- **CI/CD:** GitHub Actions

### Branch Strategy
`main` only. **No direct push.** Every change via PR.

---

## Project Structure

```
src/
  app/
    page.tsx                    # Home – shows all modules
    utilities/
      page.tsx                  # Category listing page
      [slug]/page.tsx           # Individual module page
    games/
      page.tsx
      [slug]/page.tsx
    apis/
      page.tsx
      [slug]/page.tsx
    swiss/
      page.tsx
      [slug]/page.tsx
  modules/
    utilities/
      <name>/
        index.tsx               # React UI component
        meta.ts                 # Module metadata (slug, title, tags, status)
        logic.ts                # Pure logic – no React, no DOM
        logic.test.ts           # Vitest unit tests
    games/
      <name>/
        index.tsx
        meta.ts
        logic.ts
        logic.test.ts
    apis/
      <name>/
        index.tsx
        meta.ts
        api.ts                  # API calls, fetching, Sentry integration
        api.test.ts
    swiss/
      <name>/
        index.tsx
        meta.ts
        logic.ts or api.ts      # depending on whether data is local or external
        logic.test.ts or api.test.ts
  components/
    layout/                     # header.tsx, footer.tsx, nav.tsx
    module-card.tsx
  lib/
    registry.ts                 # Central module registry – all modules listed here
    types.ts                    # Shared TypeScript types (Module, ModuleCategory, etc.)
    utils.ts                    # cn() and other shared utilities
tests/
  e2e/                          # Playwright E2E tests
```

**Golden rules:**
- Logic (`logic.ts` / `api.ts`) is always separated from UI (`index.tsx`). Pure functions, no React import, easy to unit-test.
- Metadata (`meta.ts`) is always separated from component and logic code.
- Every new module must be registered in `src/lib/registry.ts` and added to `componentMap` in the relevant `src/app/[category]/[slug]/page.tsx`.

---

## Architecture Rules

- Every module lives in `src/modules/[category]/[name]/`
- Every module has `index.tsx` (component), `meta.ts` (metadata), and `logic.ts` or `api.ts` (logic / fetching)
- New modules must be registered in `src/lib/registry.ts`
- New modules must be added to `componentMap` in the relevant `src/app/[category]/[slug]/page.tsx`
- Never put business logic in `app/` pages – pages only load modules
- Shared UI components go in `src/components/`
- Pure utility functions go in `src/lib/`
- Use `cn()` from `src/lib/utils.ts` for all conditional Tailwind classes

---

## Code Style

- TypeScript strict mode – no `any`
- Functional components only – no class components
- `'use client'` only when necessary (interactivity, hooks, browser APIs)
- Prefer server components by default
- shadcn/ui for all UI primitives
- lucide-react for icons
- No inline styles – Tailwind utility classes only

---

## Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `unit-converter.ts` |
| Components | `PascalCase` | `UnitConverter` |
| Functions / variables | `camelCase` | `convertUnit()` |
| Types / interfaces | `PascalCase` | `ModuleCategory` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_ITEMS` |

---

## Workflow Decision Tree

```
New task received
       │
       ├─ New module (utility / game / API explorer / Swiss)?
       │         └─ YES → Workflow A (Brainstorm → Spec → TDD → Implement → Register → Docs → Review)
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

## Workflow A: New Module (mandatory)

### Step 1 – Brainstorm
**Before writing any line of code**, Claude actively asks questions:
- What exactly should the module do? What should it not do?
- What are the inputs, what are the outputs?
- What edge cases (0, negative, empty, invalid)?
- Mobile-first: How does the user interact on a smartphone?
- Is it utility-like (`logic.ts`) or API-based (`api.ts`)?
- Are there similar modules in the project that can be reused?

Claude waits for answers. No assumptions.

### Step 2 – Spec (confirm in writing)
Claude summarises the requirements and waits for confirmation:

```
## Spec: [Module Name]
Category: [utilities / games / apis / swiss]
Function: [1–2 sentences]
Inputs: [list with type and validation]
Outputs: [list]
Logic / Algorithm: [core formula or flow]
Edge Cases: [list]
New files:
  - src/modules/[category]/[name]/meta.ts
  - src/modules/[category]/[name]/logic.ts  (or api.ts)
  - src/modules/[category]/[name]/logic.test.ts  (or api.test.ts)
  - src/modules/[category]/[name]/index.tsx
Registration:
  - src/lib/registry.ts
  - src/app/[category]/[slug]/page.tsx  (componentMap)
Documentation:
  - README.md update (module list)
  - docs/[category]/[name].md if complex
```

**No implementation without explicit spec confirmation.**

### Step 3 – Tests first (TDD, non-negotiable)
Claude writes `logic.test.ts` (or `api.test.ts`) completely **before** `logic.ts` exists:
- Happy path (normal case)
- Edge cases (0, negative, empty string, null/undefined)
- Error cases / invalid inputs
- Boundary values

Tests are **red** – that is correct and intentional.

### Step 4 – Implementation
1. Create `meta.ts` with module metadata
2. Implement `logic.ts` (or `api.ts`) until all tests are green
3. Create `index.tsx`: Tailwind, shadcn/ui components, mobile-first, no inline styles
4. Register module in `src/lib/registry.ts`
5. Add to `componentMap` in `src/app/[category]/[slug]/page.tsx`

### Step 5 – Update documentation (mandatory)
After every implementation:
- **`README.md`**: Add module to the appropriate category list
- **`docs/[category]/[name].md`**: Only for complex logic or external APIs
- Code comments if the logic is not self-explanatory

### Step 6 – Review checklist
Claude checks before the PR:
- [ ] All unit tests green (`npm run test`)
- [ ] No hardcoded values in `logic.ts` or `api.ts`
- [ ] No unnecessary npm packages
- [ ] Sentry error boundary for external API calls (`api.ts`)
- [ ] Mobile view works (Tailwind responsive)
- [ ] Module registered in `src/lib/registry.ts`
- [ ] Module added to `componentMap` in `src/app/[category]/[slug]/page.tsx`
- [ ] README and docs up to date
- [ ] TypeScript check passes (`npm run typecheck`)
- [ ] Build passes (`npm run build`)

---

## Workflow B: Bug Fix

1. Read the affected file, **name the root cause** before fixing
2. If `logic.ts` or `api.ts` is affected: write a failing test for the bug, **then** fix it
3. Minimal fix – no unnecessary changes to other files
4. PR description: cause + fix + affected tests

---

## Workflow C: Direct Change (styling, config, docs)

No spec needed. Change directly, create PR, short description.

---

## Documentation Rules (always follow)

| What changed? | What to update? |
|---|---|
| New module | README.md module list + `docs/[category]/` if needed |
| New ENV variable | README.md setup section + `.env.example` |
| New npm dependency | README.md tech stack if relevant |
| Breaking change to structure | Code comment + README + CLAUDE.md |
| Complex API integration | `docs/[category]/[name].md` |

Claude **always** checks whether documentation needs updating – without explicit prompt.

---

## Conventions

- **Commits:** Conventional Commits – `feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`
- **Language:** Everything in English – code, comments, documentation, commit messages, PR descriptions, Claude responses, and all repo content. This applies even when the user communicates in German.
- **Components:** Functional components, hooks, no class-based React
- **Logic:** Always extracted to `logic.ts` or `api.ts` – pure functions, no side effects
- **Styling:** Tailwind utility classes + shadcn/ui, no inline CSS, no separate CSS except `globals.css`
- **Error handling:** `Sentry.captureException()` for unexpected errors and API calls
- **Secrets:** Only via `.env.local` (local) / Netlify Environment Variables (prod)

---

## Testing

| Tool | Purpose | Location |
|---|---|---|
| Vitest | Unit tests for logic and API parsing | `src/modules/[category]/[name]/[name].test.ts` |
| Playwright | E2E tests for user flows | `tests/e2e/` |

```bash
npm run test          # Run all unit tests once
npm run test:watch    # Run unit tests in watch mode
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:ui   # Run Playwright with UI
```

---

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run Playwright with UI |
| `npx shadcn@latest add [component]` | Add a shadcn/ui component |

## Claude Code Slash Commands

| Command | Description |
|---|---|
| `/new-utility-tool` | New calculator, converter, or text tool |
| `/new-minigame` | New browser-based game |
| `/new-api-explorer` | New hands-on API demo |
| `/new-swiss-module` | New Swiss-specific tool or reference |
| `/bugfix` | Structured bug fix workflow |
| `/update-docs` | Check and update all documentation |
| `/pr-summary` | Generate PR description from git diff |

---

## Prohibitions (never, under any circumstances)

- ❌ Direct push to `main`
- ❌ Implementation without confirmed spec (for new features)
- ❌ Skipping, disabling, or commenting out tests
- ❌ Touching `.env` files or logging their contents
- ❌ New npm packages without a brief justification and bundle size consideration
- ❌ Removing or disabling Sentry
- ❌ Not updating documentation after a change
- ❌ Writing anything in the repository in a language other than English
- ❌ Adding a database without updating CLAUDE.md first
- ❌ Adding authentication without updating CLAUDE.md first
- ❌ Using inline styles
