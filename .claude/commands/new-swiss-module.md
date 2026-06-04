---
name: new-swiss-module
description: Starts the full workflow for a new Swiss module (Brainstorm → Spec → TDD → Implement → Register → Docs)
argument-hint: "[module name or brief idea]"
---

# /new-swiss-module

Starts Workflow A for a new **Swiss module** (Swiss-specific tools, references, or API explorers).

## Flow

**Step 1 – Brainstorm**
Claude asks the following questions (all of them, before any code is written):
1. What exactly does this module do? What Swiss topic does it cover?
2. Is it utility-like (pure logic) or API-based (external data source)?
3. What are the inputs and outputs?
4. What data sources are used? (official Swiss APIs, static data, scraping?)
5. Does it require an API key?
6. What edge cases need to be handled?
7. What does the mobile interaction look like?

**Step 2 – Spec**
Claude summarises in writing and waits for confirmation. No proceeding without OK.

**Step 3 – Tests first**
Write `src/modules/swiss/<name>/logic.test.ts` (or `api.test.ts`) with all test cases (Vitest).
Tests are red – that's correct.

**Step 4 – Implementation**
1. `src/modules/swiss/<name>/meta.ts` → module metadata
2. `src/modules/swiss/<name>/logic.ts` or `api.ts` → all tests green
3. `src/modules/swiss/<name>/index.tsx` → Tailwind, shadcn/ui, mobile-first
4. Register in `src/lib/registry.ts`
5. Add to `componentMap` in `src/app/swiss/[slug]/page.tsx`

**Step 5 – Documentation**
- Update README.md Swiss list
- `docs/swiss/<name>.md` with data source references, API details, or data model explanation

**Step 6 – PR description**
Output finished PR description from template.
