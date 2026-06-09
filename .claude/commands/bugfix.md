---
name: bugfix
description: Structured bug fix workflow without brainstorm overhead
argument-hint: "[brief description of the bug]"
---

# /bugfix

Workflow B – bug fix without brainstorm.

## Prompt Template

```text
/bugfix

Problem: [what is broken]
File / Component: [where, e.g. src/modules/utilities/unit-converter/logic.ts]
Expected behaviour: [what should happen]
Actual behaviour: [what happens instead]
Reproducible: [always / sometimes / under condition X]
```

## What Claude does

1. Read the affected file, name the root cause
2. If `logic.ts` or `api.ts` is affected: write a failing Vitest test for the bug, then fix it
3. Minimal fix – no unnecessary changes
4. Run `/update-docs` — verify no doc surface is stale after the fix
5. PR description with cause, fix, and affected tests
