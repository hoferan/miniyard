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
    loading.tsx                 # Root loading boundary (CategoryPageSkeleton)
    utilities/
      page.tsx                  # Category listing page
      loading.tsx               # Category loading boundary
      [slug]/page.tsx           # Individual module page (statically generated)
      [slug]/loading.tsx        # Module loading boundary
    games/
      page.tsx
      loading.tsx
      [slug]/page.tsx
      [slug]/loading.tsx
  modules/
    utilities/
      README.md                 # Category definition – what belongs here, brainstorm questions
      <name>/
        index.tsx               # React UI component
        meta.ts                 # Module metadata (slug, title, tags, createdAt)
        logic.ts                # Pure logic – no React, no DOM
        logic.test.ts           # Vitest unit tests
        messages.ts             # (optional) User-facing strings – only when error/status messages exist
    games/
      README.md                 # Category definition
      <name>/
        index.tsx
        meta.ts
        logic.ts
        logic.test.ts
        messages.ts             # (optional) User-facing strings
  components/
    layout/                     # header.tsx, footer.tsx, mobile-tab-bar.tsx
    module-card.tsx
    module-page-layout.tsx      # Shared breadcrumb + heading layout for module detail pages
    module-page-skeleton.tsx    # Loading skeleton for module detail pages
    category-page-skeleton.tsx  # Loading skeleton for category/home listing pages
    utilities-module-content.tsx  # componentMap + dynamic imports for utilities
    games-module-content.tsx      # componentMap + dynamic imports for games
  lib/
    registry.ts                 # Central module registry – all modules listed here
    types.ts                    # Shared TypeScript types (Module, ModuleCategory, etc.)
    utils.ts                    # cn() and other shared utilities
    nav.ts                      # Shared NAV_LINKS constant
    icons.ts                    # Lucide icon name → component map (add new icons here)
    high-score.ts               # createHighScoreStore(key) – shared localStorage utility for games
tests/
  e2e/                          # Playwright E2E tests
```

**Golden rules:**
- Logic (`logic.ts`) is always separated from UI (`index.tsx`). Pure functions, no React import, easy to unit-test.
- Metadata (`meta.ts`) is always separated from component and logic code.
- Every new module must be registered in `src/lib/registry.ts` and added to `componentMap` in the relevant `src/components/[category]-module-content.tsx`.
- Every category has a `README.md` in `src/modules/[category]/README.md`. This file defines what belongs in the category and is read by Claude before creating new modules.

---

## Architecture Rules

- Every module lives in `src/modules/[category]/[name]/`
- Every module has `index.tsx` (component), `meta.ts` (metadata), and `logic.ts` (logic)
- New modules must be registered in `src/lib/registry.ts`
- New modules must be added to `componentMap` in the relevant `src/components/[category]-module-content.tsx`
- Never put business logic in `app/` pages – pages only load modules
- Shared UI components go in `src/components/`
- Pure utility functions go in `src/lib/`
- Use `cn()` from `src/lib/utils.ts` for all conditional Tailwind classes
- User-facing strings (error messages, status labels, UI copy) live in a per-module `messages.ts` — only create this file when a module has such strings. `logic.ts` imports from it and stays string-free. `index.tsx` may also import directly when the strings are display-only and not needed by the conversion/game logic.

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
       ├─ GitHub issue number given?
       │         └─ YES → /issue #[n] (reads issue, classifies, runs correct workflow, opens PR)
       │
       ├─ New module (any category)?
       │         └─ YES → /new-module → Workflow A
       │
       ├─ New category?
       │         └─ YES → /new-category command
       │
       ├─ Bug fix?
       │         └─ YES → Workflow B (/systematic-debugging → fix → /verification-before-completion)
       │
       ├─ UI adjustment / styling?
       │         └─ YES → Workflow C (change → /verification-before-completion)
       │
       └─ Refactor / cleanup?
                 └─ YES → Workflow C (change → /verification-before-completion)
```

---

## Workflow A: New Module (mandatory)

Superpowers skills drive this workflow. Invoke them in order — do not skip or reorder.

1. **`/brainstorming`** — Read `src/modules/[category]/README.md` first. Ask category-specific questions plus:
   - Are there similar modules that can be reused?
   - Mobile-first: how does the user interact on a smartphone?
   No code before design is approved.

2. **`/writing-plans`** — Write the spec. The plan must include:

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
     - src/modules/[category]/[name]/messages.ts  (optional — only when the module has user-facing strings)
     - tests/e2e/[name].spec.ts
   Registration:
     - src/lib/registry.ts
     - src/components/[category]-module-content.tsx  (componentMap)
   Documentation:
     - README.md update (module list)
     - docs/[category]/[name].md if complex
   ```

3. **`/test-driven-development`** — Write `logic.test.ts` completely before `logic.ts` exists. Tests must be red first.

4. **`/executing-plans`** — Implement in this order:
   1. `meta.ts` — module metadata
   2. `logic.ts` — pure functions until all tests are green
   3. `messages.ts` — user-facing strings (only when the module has UI copy / status text)
   4. `index.tsx` — Tailwind, shadcn/ui, mobile-first, no inline styles
   5. Register in `src/lib/registry.ts`
   6. Add to `componentMap` in `src/components/[category]-module-content.tsx`
   7. `tests/e2e/[name].spec.ts` — E2E test covering the main user flow; include a `page.screenshot()` call to produce a visual artifact

5. **`/update-docs`** — Add module to README.md list; create `docs/[category]/[name].md` only for complex logic.

6. **`/verification-before-completion`** — Confirm before the PR:
   - [ ] All unit tests green (`npm run test`)
   - [ ] E2E test written and green (`npm run test:e2e`) — covers the main user flow
   - [ ] Screenshot from E2E test reviewed — confirms the module looks correct in its default state
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

1. **`/systematic-debugging`** — name the root cause before touching any code
2. **`/test-driven-development`** — if `logic.ts` is affected, write a failing test first
3. Minimal fix — no unnecessary changes to other files
4. **`/update-docs`** — verify no doc surface is stale
5. **`/verification-before-completion`** — before creating the PR
6. PR description: cause + fix + affected tests

---

## Workflow C: Direct Change (styling, config, docs)

1. Change directly — no spec needed
2. **`/update-docs`** — verify no doc surface is stale
3. **`/verification-before-completion`** — before creating the PR

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
  loading.tsx                  # Category loading boundary (CategoryPageSkeleton)
  [slug]/page.tsx              # Module detail page (uses ModulePageLayout + module-content)
  [slug]/loading.tsx           # Module loading boundary (ModulePageSkeleton)

src/components/
  [category]-module-content.tsx  # componentMap + dynamic imports for this category

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
| `.lighthouserc.json` | Add the category listing URL and one representative module URL |

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
import { getModuleBySlug, getModulesByCategory } from '@/lib/registry'
import { notFound } from 'next/navigation'
import { [Category]ModuleContent } from '@/components/[category]-module-content'
import { ModulePageLayout } from '@/components/module-page-layout'
import type { Metadata } from 'next'

export const dynamicParams = false

export function generateStaticParams() {
  return getModulesByCategory('[category]').map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return {}
  return { title: mod.title, description: mod.description }
}

export default async function [Category]ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return notFound()
  return (
    <ModulePageLayout mod={mod}>
      <[Category]ModuleContent slug={slug} />
    </ModulePageLayout>
  )
}
```

`src/components/[category]-module-content.tsx`:
```tsx
'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  // '[slug]': dynamic(() => import('@/modules/[category]/[slug]'), { loading: ModuleSkeleton, ssr: false }),
}

export function [Category]ModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
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

## Experimental Features

miniyard uses a lightweight, localStorage-based feature flag system to ship experimental functionality safely. All experimental features are opt-in — users enable them on the `/features` (Labs) page. Settings persist per browser; production and deploy previews always run the same code.

### System files

| File | Role |
|---|---|
| `src/lib/features.ts` | Central registry — defines every experimental feature (`id`, `title`, `description`, `defaultEnabled`) |
| `src/components/features-provider.tsx` | React context — reads localStorage on mount, exposes `useFeatureFlag(id)` to any client component |
| `src/app/features/page.tsx` | The `/features` (Labs) page — lists all features with toggle switches automatically |

### How to add a new experimental feature

1. Add an entry to `FEATURES` in `src/lib/features.ts`:

   ```ts
   {
     id: 'my-feature',
     title: 'Human-readable title',
     description: 'One sentence explaining what this does.',
     defaultEnabled: false,
   }
   ```

2. Gate the new behaviour in the relevant client component with `useFeatureFlag`:

   ```tsx
   import { useFeatureFlag } from '@/components/features-provider'

   const myFeatureEnabled = useFeatureFlag('my-feature')
   ```

3. The feature automatically appears on `/features` — no page edits needed.

### Graduating a feature to stable

When a feature is ready to ship to everyone: remove its entry from `FEATURES` in `src/lib/features.ts` and remove the `useFeatureFlag` guard from the component. Do not leave dead flags in the registry.

### Flag conventions

- All new features have `defaultEnabled: false`
- Feature `id` values are `kebab-case`
- Descriptions are one sentence, present tense, user-facing (e.g. "Adds tag chips to category pages.")
- Never use env vars to gate experimental features — localStorage keeps prod and preview identical

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

### Project commands

| Command | Description |
|---|---|
| `/new-module` | New module in any category (reads category README automatically) |
| `/new-category` | Add an entirely new module category |
| `/bugfix` | Structured bug fix workflow |
| `/issue #[n]` | Read a GitHub issue, brainstorm it, implement it, and open a PR that closes it |
| `/update-docs` | Check and update all documentation |
| `/pr-summary` | Generate PR description from git diff |
| `/review-threads` | Interactive review of all open PR threads — CodeRabbit, human reviewers, and your own |
| `/github-issue` | Create a GitHub issue via natural language — detects template, asks questions, proposes content for approval |
| `/create-pr` | Create a pull request — reads the diff, fills the template, asks only what it can't infer, proposes for approval |
| `/add-shadcn` | Add a shadcn/ui component by fetching it directly from GitHub (cloud-safe alternative to `npx shadcn add`) |

### Superpowers skills (obra/superpowers)

These skills govern HOW work is done. They take precedence over default behaviour. Project-specific rules above (file structure, naming, registration) define WHAT to build — superpowers defines the process.

| Command | Trigger point |
|---|---|
| `/brainstorming` | Before any feature, component, or behaviour change — design gate |
| `/writing-plans` | After brainstorm, before touching code on multi-step tasks |
| `/executing-plans` | Running a written plan with review checkpoints |
| `/test-driven-development` | Before writing implementation code (Workflow A Step 3) |
| `/systematic-debugging` | Before proposing any fix for a bug (Workflow B Step 1) |
| `/verification-before-completion` | Before claiming work is done or creating a PR |
| `/requesting-code-review` | After completing a feature, before merging |
| `/receiving-code-review` | Before implementing any review feedback |
| `/finishing-a-development-branch` | When all tests pass and ready to integrate |
| `/subagent-driven-development` | Parallel tasks within one session |
| `/dispatching-parallel-agents` | Two or more independent tasks across separate agents |
| `/using-git-worktrees` | Isolated feature work that must not affect current workspace |
| `/using-superpowers` | Session start — discovers and bootstraps all skills |
| `/writing-skills` | Creating or editing skill files |

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
