---
name: bugfix
description: Use when fixing a bug, broken behavior, incorrect output, or unexpected error in an existing module. Also triggered by "something is broken", "this doesn't work", "wrong result", "fix the error", "there's a bug".
argument-hint: "[brief description of the bug]"
---

# /bugfix

Workflow B – structured bug fix.

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

1. Invoke `/systematic-debugging` — find and name the root cause before touching any code
2. Invoke `/test-driven-development` — write a failing test that reproduces the bug (required when `logic.ts` or `api.ts` is affected)
3. Apply the minimal fix — no unrelated changes to other files
4. Run `/update-docs` — verify no documentation surface is stale after the fix
5. Invoke `/verification-before-completion` — run all checks and confirm output before creating the PR
6. PR description: cause, fix, and affected tests
