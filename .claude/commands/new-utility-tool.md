---
name: new-utility-tool
description: Starts the full workflow for a new utility tool (Brainstorm → Spec → TDD → Implement → Register → Docs)
argument-hint: "[tool name or brief idea]"
---

# /new-utility-tool

Starts Workflow A for a new **Utility Tool** (calculator, converter, text tool, etc.).

## Flow

**Step 1 – Brainstorm**
Claude asks the following questions (all of them, before any code is written):
1. What exactly should the tool calculate / process?
2. What are the inputs? (types, units, validation)
3. What is the output? (number, text, list?)
4. Is there a formula or known logic?
5. What edge cases need to be handled? (0, negative, empty, invalid)
6. What does the mobile interaction look like? (slider, input fields, buttons?)

**Step 2 – Spec**
Claude summarises in writing and waits for confirmation. No proceeding without OK.

**Step 3 – Tests first**
Write `src/modules/utilities/<name>/logic.test.ts` with all test cases (Vitest).
Tests are red – that's correct.

**Step 4 – Implementation**
1. `src/modules/utilities/<name>/meta.ts` → module metadata
2. `src/modules/utilities/<name>/logic.ts` → all tests green
3. `src/modules/utilities/<name>/index.tsx` → Tailwind, shadcn/ui, mobile-first
4. Register in `src/lib/registry.ts`
5. Add to `componentMap` in `src/app/utilities/[slug]/page.tsx`

**Step 5 – Documentation**
- Update README.md utilities list
- `docs/utilities/<name>.md` if logic is complex

**Step 6 – PR description**
Output finished PR description from template.
