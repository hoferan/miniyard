---
name: update-docs
description: Checks whether README, docs/ and comments are still up to date after a change and updates them
---

# /update-docs

Checks and updates all documentation after a change.

## What Claude checks

1. **README.md** – Are all modules in the correct category lists?
   Is anything missing? Has a module been renamed or removed?

2. **docs/[category]/** – Is there complex logic or API integrations without documentation?

3. **ENV variables** – Are all `.env` keys documented in README and in `.env.example`?

4. **Code comments** – Is complex logic (`logic.ts` / `api.ts`) self-explanatory or does it need comments?

5. **registry.ts** – Is every module registered? No orphaned entries?

6. **componentMap** – Does every registered module have a matching entry in `src/app/[category]/[slug]/page.tsx`?

## When to use

- After an implementation where docs were forgotten
- Before a PR as a final check
- When `README.md` looks outdated
