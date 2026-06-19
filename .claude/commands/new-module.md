---
name: new-module
description: Starts the full workflow for a new module in any category (Brainstorm → Spec → TDD → Implement → Register → Docs). Also triggered by "let's build a", "add a new tool", "create a module", "I want a calculator / converter / game".
argument-hint: "[module idea or name]"
---

# /new-module

Generic entry point for any new module. Follows Workflow A — delegates to superpowers skills at each step.

## Step 1 – Choose category

Read `src/modules/` and list the available categories with one-line descriptions from each `README.md`.

Ask: **"Which category should this module go in?"**

**If the user names a category that does not exist in `src/modules/`:**

Stop and reply:
> "The category `[name]` does not exist yet. Please run `/new-category` first to set it up (creates the category README, app pages, and type definitions). Once done, run `/new-module` again."

Do not attempt to create the category inline, do not continue the module workflow, do not make assumptions.

## Step 2 – Read the category README

Read `src/modules/[category]/README.md` in full. This defines:
- What belongs in this category
- Category-specific brainstorm questions
- Module conventions and constraints

## Step 3 – Brainstorm

Invoke `/brainstorming` — use the category README's brainstorm questions as the starting context. Ask one question at a time. Do not write any code until the design is approved.

## Step 4 – Spec

Invoke `/writing-plans` — write the implementation plan using this required structure:

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
  - src/modules/[category]/[name]/messages.ts  (only when user-facing strings exist)
  - tests/e2e/[name].spec.ts
Registration:
  - src/lib/registry.ts
  - src/app/[category]/[slug]/page.tsx  (componentMap)
```

**No implementation without explicit confirmation.**

## Step 5 – Tests first

Invoke `/test-driven-development` — write `logic.test.ts` completely before `logic.ts` exists. Tests must be red.

## Step 6 – Implementation

1. `meta.ts` — module metadata (slug, title, description, icon, tags, status)
2. `logic.ts` — implement until all tests are green
3. `messages.ts` — user-facing strings (only when the module has UI copy, error messages, or status text)
4. `index.tsx` — Tailwind, shadcn/ui, mobile-first, `'use client'` only if needed
5. Register in `src/lib/registry.ts`
6. Add to `componentMap` in `src/app/[category]/[slug]/page.tsx`
7. `tests/e2e/[name].spec.ts` — E2E test covering the main user flow; include `page.screenshot()` to produce a visual artifact

## Step 7 – Documentation

Run `/update-docs` — checks all documentation surfaces and applies what is missing:
- `README.md` — add module to the correct category table
- `docs/[category]/[name].md` — only if logic is complex
- Code comments where non-obvious

## Step 8 – Verify and complete

Invoke `/verification-before-completion` — confirm all checks pass before creating the PR.

## Step 9 – PR description

Output finished PR description from `.github/PULL_REQUEST_TEMPLATE.md`.
