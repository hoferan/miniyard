---
name: update-docs
description: Checks whether README, docs/ and comments are still up to date after a change and updates them
---

# /update-docs

Checks and updates all documentation after a change.

## What Claude checks

1. **README.md** – Are all tools, games, and explorers in the lists?
   Is anything missing? Has a tool been renamed or removed?

2. **docs/tools/** – Is there complex logic or API integrations without documentation?

3. **ENV variables** – Are all `.env` keys documented in the README setup section?

4. **Code comments** – Is complex logic (`logic.ts`) self-explanatory or does it need comments?

## When to use

- After an implementation where docs were forgotten
- Before a PR as a final check
- When `README.md` looks outdated
