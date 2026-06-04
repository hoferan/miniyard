---
name: pr-summary
description: Generates a finished PR description based on git diff to main
---

# /pr-summary

Generates a finished PR description.

## What Claude does

1. Analyse `git diff main`
2. Fill in the PR template from `.github/PULL_REQUEST_TEMPLATE.md`
3. Suggest a conventional commit title
4. Mark checklist items as done / open

## Output

Finished PR description ready to paste into GitHub.
