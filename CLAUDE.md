# miniyard – Claude Code Instructions

## Project Overview

**miniyard** is a modular playground platform. It starts with two categories and grows over time:

| Category | Description | Path |
|---|---|---|
| **Utilities** | Calculators, converters, text tools, math functions | `src/modules/utilities/` |
| **Games** | Browser games, mobile-first | `src/modules/games/` |

Solo developer. Learning and showcase project. New categories are added when needed — see [How to add a new category](#how-to-add-a-new-category). Each category has a `README.md` in its module directory that defines what belongs there and guides Claude when creating new modules.

### Stack
- **Framework:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Components:** shadcn/ui
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Hosting:** Netlify with PR Preview Deployments
- **Error Tracking:** Sentry
- **Coverage & Bundle Analysis:** Codecov
- **Code Review:** CodeRabbit (automatic on every PR)
- **Dependencies:** Dependabot (weekly, Monday)
- **CI/CD:** GitHub Actions

### Branch Strategy
`main` only. **No direct push.** Every change via PR.

---

## Project Structure

```text
src/
  app/
    page.tsx                    # Home – shows all modules
    utilities/
      page.tsx                  # Category listing page
      [slug]/page.tsx           # Individual module page
    games/
      page.tsx
      [slug]/page.tsx
  modules/
    utilities/
      README.md                 # Category definition – what belongs here, brainstorm questions
      <name>/
        index.tsx               # React UI component
        meta.ts                 # Module metadata (slug, title, tags, status)
        logic.ts                # Pure logic – no React, no DOM
        logic.test.ts           # Vitest unit tests
    games/
      README.md                 # Category definition
      <name>/
        index.tsx
        meta.ts
        logic.ts
        logic.test.ts
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
- Logic (`logic.ts`) is always separated from UI (`index.tsx`). Pure functions, no React import, easy to unit-test.
- Metadata (`meta.ts`) is always separated from component and logic code.
- Every new module must be registered in `src/lib/registry.ts` and added to `componentMap` in the relevant `src/app/[category]/[slug]/page.tsx`.
- Every category has a `README.md` in `src/modules/[category]/README.md`. This file defines what belongs in the category and is read by Claude before creating new modules.

---

## Architecture Rules

- Every module lives in `src/modules/[category]/[name]/`
- Every module has `index.tsx` (component), `meta.ts` (metadata), and `logic.ts` (logic)
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

```text
New task received
       │
       ├─ New module (any category)?
       │         └─ YES → /new-module (reads category README, then Workflow A)
       │
       ├─ New category?
       │         └─ YES → /new-category command
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

Always start with `/new-module`. Claude reads `src/modules/[category]/README.md` first to understand the category context and derive the right brainstorm questions.

### Step 1 – Brainstorm
**Before writing any line of code**, Claude reads the category README and asks its defined questions. Additional generic questions:
- Are there similar modules in the project that can be reused?
- Mobile-first: How does the user interact on a smartphone?

Claude waits for answers. No assumptions.

### Step 2 – Spec (confirm in writing)
Claude summarises the requirements and waits for confirmation:

```text
## Spec: [Module Name]
Category: [utilities / games / ...]
Function: [1–2 sentences]
Inputs: [list with type and validation]
Outputs: [list]
Logic / Algorithm: [core formula or flow]
Edge Cases: [list]
New files:
  - src/modules/[category]/[name]/meta.ts
  - src/modules/[category]/[name]/logic.ts
  - src/modules/[category]/[name]/logic.test.ts
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
Claude writes `logic.test.ts` completely **before** `logic.ts` exists:
- Happy path (normal case)
- Edge cases (0, negative, empty string, null/undefined)
- Error cases / invalid inputs
- Boundary values

Tests are **red** – that is correct and intentional.

### Step 4 – Implementation
1. Create `meta.ts` with module metadata
2. Implement `logic.ts` until all tests are green
3. Create `index.tsx`: Tailwind, shadcn/ui components, mobile-first, no inline styles
4. Register module in `src/lib/registry.ts`
5. Add to `componentMap` in `src/app/[category]/[slug]/page.tsx`

### Step 5 – Update documentation (mandatory)
Run `/update-docs`. It checks all documentation surfaces and applies what is missing:
- **`README.md`**: Add module to the appropriate category list
- **`docs/[category]/[name].md`**: Only for complex logic
- Code comments if the logic is not self-explanatory

### Step 6 – Review checklist
Claude checks before the PR:
- [ ] All unit tests green (`npm run test`)
- [ ] No hardcoded values in `logic.ts`
- [ ] No unnecessary npm packages
- [ ] Mobile view works (Tailwind responsive)
- [ ] Module registered in `src/lib/registry.ts`
- [ ] Module added to `componentMap` in `src/app/[category]/[slug]/page.tsx`
- [ ] `/update-docs` run — no pending doc updates
- [ ] TypeScript check passes (`npm run typecheck`)
- [ ] Build passes (`npm run build`)

---

## Workflow B: Bug Fix

1. Read the affected file, **name the root cause** before fixing
2. If `logic.ts` is affected: write a failing test for the bug, **then** fix it
3. Minimal fix – no unnecessary changes to other files
4. Run `/update-docs` — verify no doc surface is stale after the fix
5. PR description: cause + fix + affected tests

---

## Workflow C: Direct Change (styling, config, docs)

No spec needed. Change directly, run `/update-docs`, create PR, short description.

---

## How to Add a New Category

Use `/new-category` or follow this checklist manually. Do **not** create a new category without confirming the name and purpose with the user first.

### What to confirm before starting
- Category name (singular, lowercase, e.g. `swiss`, `apis`)
- URL slug (same as name)
- Short description (1 sentence)
- Icon (emoji)
- Module pattern: utility-like (`logic.ts`) or API-based (`api.ts`)?

### Files to create

```text
src/app/[category]/
  page.tsx                     # Category listing page
  [slug]/page.tsx              # Module detail page with componentMap

src/modules/[category]/        # Empty directory (first module goes here)

.claude/commands/
  new-[category]-module.md     # Slash command for new modules in this category

.github/ISSUE_TEMPLATE/
  new_[category]_module.yml    # GitHub issue template
```

### Files to update

| File | Change |
|---|---|
| `src/lib/types.ts` | Add `'[category]'` to `ModuleCategory` union |
| `src/components/layout/nav.tsx` | Add navigation link |
| `README.md` | Add new category section with empty table |
| `CLAUDE.md` | Update categories table, project structure, slash commands list |

### page.tsx template

`src/app/[category]/page.tsx`:
```tsx
import { getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'

export default function [Category]Page() {
  const modules = getModulesByCategory('[category]')
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">[Category Label]</h1>
      <p className="text-muted-foreground mb-8">[Short description]</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </div>
    </main>
  )
}
```

`src/app/[category]/[slug]/page.tsx`:
```tsx
import { getModuleBySlug } from '@/lib/registry'
import { notFound } from 'next/navigation'

const componentMap: Record<string, React.ComponentType> = {
  // Add module components here as they are created
}

export default async function [Category]ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const module = getModuleBySlug(slug)
  const Component = componentMap[slug]
  if (!module || !Component) return notFound()
  return <Component />
}
```

### Verification after adding a category
```bash
npm run typecheck   # ModuleCategory type must be valid
npm run build       # New pages must compile
npm run test        # No regressions
```

---

## Documentation Rules (always follow)

| What changed? | What to update? |
|---|---|
| New module | README.md module list + `docs/[category]/` if needed |
| New category | All files listed in the "How to add a new category" section above + `src/modules/[category]/README.md` |
| Category definition change | `src/modules/[category]/README.md` |
| New ENV variable | README.md setup section + `.env.example` |
| New npm dependency | README.md tech stack if relevant |
| Breaking change to structure | Code comment + README + CLAUDE.md |

Claude **always** checks whether documentation needs updating – without explicit prompt.

---

## Conventions

- **Commits:** Conventional Commits – `feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`
- **Language:** Everything in English – code, comments, documentation, commit messages, PR descriptions, Claude responses, and all repo content. This applies even when the user communicates in German.
- **Components:** Functional components, hooks, no class-based React
- **Logic:** Always extracted to `logic.ts` – pure functions, no side effects
- **Styling:** Tailwind utility classes + shadcn/ui, no inline CSS, no separate CSS except `globals.css`
- **Error handling:** `Sentry.captureException()` for unexpected errors
- **Secrets:** Only via `.env.local` (local) / Netlify Environment Variables (prod)
- **npm versions:** Always pin exact versions in `package.json` — no `^` or `~` prefixes. When installing a new package, strip the range prefix immediately (e.g. `"10.56.0"` not `"^10.56.0"`). Dependabot handles upgrades.
- **Markdown:** Every fenced code block must have a language identifier — use ` ```text ` for plain-text examples, ` ```bash ` for shell, ` ```ts ` for TypeScript snippets. Bare ` ``` ` fences are forbidden (MD040 is enforced by CI and the pre-commit hook).

---

## Testing

| Tool | Purpose | Location |
|---|---|---|
| Vitest | Unit tests for logic | `src/modules/[category]/[name]/logic.test.ts` |
| Playwright | E2E tests for user flows | `tests/e2e/` |

```bash
npm run test          # Run all unit tests once
npm run test:watch    # Run unit tests in watch mode
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:ui   # Run Playwright with UI
```

---

## Context Management

Monitor session length actively. Long sessions degrade response quality.

**Rule:** When context compression occurs (system messages about prior message summarisation appear), or after approximately 15–20 significant exchanges, proactively check and mention it:

1. Suggest the user run `/compact` to compress the current context, or
2. Ask: *"This session is getting long — would you like to start a fresh session? I can summarise the current state first."*
3. Aim to raise this at roughly 60% estimated capacity — before quality degrades, not after.

When handing over to a new session, first output a short summary: what was done, what the next step is, any open decisions.

---

## Adding shadcn/ui Components

`npx shadcn@latest add` **may fail with a 403 in locked-down cloud containers** where outbound access to `ui.shadcn.com` is blocked. If you encounter a 403 (or want a network-independent approach), use the manual copy approach instead:

1. Use WebFetch to retrieve the component source from the shadcn GitHub repo:
   `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/new-york/ui/<name>.tsx`
2. Write the content exactly as-is to `src/components/ui/<name>.tsx`
3. Inspect the component source for `import` statements referencing other `@/components/ui/<x>` paths — fetch and install any that are missing the same way
4. Inspect the component source for any `import` statements referencing packages not in `package.json` — install those with `npm install` using exact versions (no `^` or `~`)

If the raw URL returns a 404, browse `https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/new-york/ui` first to confirm the correct filename before writing.

**Locally:** `npx shadcn@latest add <name>` still works as normal.

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
| `npx shadcn@latest add [component]` | Add a shadcn/ui component — **local only**, see "Adding shadcn/ui Components" above for cloud |
| `npm run lint:md` | Check all markdown files for lint errors (MD040 etc.) |
| `git config core.hooksPath .githooks` | Activate pre-commit hooks (run once after cloning) |
| `/compact` | Compress current session context |

## Claude Code Slash Commands

| Command | Description |
|---|---|
| `/new-module` | New module in any category (reads category README automatically) |
| `/new-category` | Add an entirely new module category |
| `/bugfix` | Structured bug fix workflow |
| `/update-docs` | Check and update all documentation |
| `/pr-summary` | Generate PR description from git diff |
| `/review-threads` | Interactive review of all open PR threads — CodeRabbit, human reviewers, and your own |
| `/github-issue` | Create a GitHub issue via natural language — detects template, asks questions, proposes content for approval |
| `/create-pr` | Create a pull request — reads the diff, fills the template, asks only what it can't infer, proposes for approval |
| `/add-shadcn` | Add a shadcn/ui component by fetching it directly from GitHub (cloud-safe alternative to `npx shadcn add`) |

---

## Prohibitions (never, under any circumstances)

- ❌ Direct push to `main`
- ❌ Implementation without confirmed spec (for new features)
- ❌ Skipping, disabling, or commenting out tests
- ❌ Touching `.env` files or logging their contents
- ❌ New npm packages without a brief justification and bundle size consideration
- ❌ Adding a npm package with a `^` or `~` version prefix — always pin exact versions
- ❌ Removing or disabling Sentry
- ❌ Not updating documentation after a change
- ❌ Writing anything in the repository in a language other than English
- ❌ Adding a database without updating CLAUDE.md first
- ❌ Adding authentication without updating CLAUDE.md first
- ❌ Using inline styles
- ❌ Fenced code blocks without a language identifier in `.md` files — use ` ```text ` for plain-text blocks (MD040)
