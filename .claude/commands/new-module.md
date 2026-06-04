---
name: new-module
description: Starts the full workflow for a new module in any category (Brainstorm → Spec → TDD → Implement → Register → Docs)
argument-hint: "[module idea or name]"
---

# /new-module

Generic entry point for any new module. Claude reads the target category's README to understand context and asks the right questions automatically.

## Flow

### Step 1 – Choose category

List the available categories by reading `src/modules/` and show them with one-line descriptions taken from each `README.md`:

```text
src/modules/
  utilities/   → src/modules/utilities/README.md
  games/       → src/modules/games/README.md
  ...
```

Ask the user: **"Which category should this module go in?"**

**If the user names a category that does not exist in `src/modules/`:**

Stop immediately. Do not proceed. Reply with:

> "The category `[name]` does not exist yet. Please run `/new-category` first to set it up (this creates the category README, app pages, and type definitions). Once that is done, come back and run `/new-module` again."

Do not attempt to create the category inline, do not continue the module workflow, do not make assumptions.

### Step 2 – Read the category README

Read `src/modules/[category]/README.md` in full. This file defines:
- What belongs in this category
- Category-specific brainstorm questions
- Module conventions and constraints

### Step 3 – Brainstorm

Ask the category-specific brainstorm questions from the README. Do not skip any. Wait for all answers before proceeding.

### Step 4 – Spec (confirm in writing)

Summarise and wait for confirmation:

```text
## Spec: [Module Name]
Category: [category]
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
```

**No implementation without explicit confirmation.**

### Step 5 – Tests first (TDD)

Write `logic.test.ts` completely before `logic.ts` exists:
- Happy path
- All edge cases from the spec
- Invalid / boundary inputs

Tests are **red** — that is correct and intentional.

### Step 6 – Implementation

1. `meta.ts` — module metadata (slug, title, description, icon, tags, status)
2. `logic.ts` — implement until all tests are green
3. `index.tsx` — Tailwind, shadcn/ui, mobile-first, `'use client'` only if needed
4. Register in `src/lib/registry.ts`
5. Add to `componentMap` in `src/app/[category]/[slug]/page.tsx`

### Step 7 – Documentation

- Update `README.md` — add module to the correct category table
- Add `docs/[category]/[name].md` only if logic is complex

### Step 8 – Review checklist

- [ ] All tests green (`npm run test`)
- [ ] No hardcoded values in `logic.ts`
- [ ] Module registered in `registry.ts` and `componentMap`
- [ ] Mobile view works
- [ ] TypeScript check passes (`npm run typecheck`)
- [ ] Build passes (`npm run build`)
- [ ] README updated

### Step 9 – PR description

Output finished PR description from `.github/PULL_REQUEST_TEMPLATE.md`.
