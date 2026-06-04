---
name: new-utility-tool
description: Starts the full workflow for a new utility tool (Brainstorm → Spec → TDD → Implement → Docs)
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
Write `src/tools/<name>/logic.test.ts` with all test cases.
Tests are red – that's correct.

**Step 4 – Implementation**
`src/tools/<name>/logic.ts` → all tests green.
`src/tools/<name>/index.tsx` → Tailwind, mobile-first.

**Step 5 – Documentation**
- Update README.md tool list
- `docs/tools/<name>.md` if logic is complex

**Step 6 – PR description**
Output finished PR description from template.
