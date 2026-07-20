<!--
  miniyard Pull Request
  ──────────────────────────────────────────────────────────────
  HTML comments like this one are editor-only and do not appear
  in the rendered PR description.

  CodeRabbit reads the full description to calibrate its review.
  The more context you provide, the more focused the feedback.
  ──────────────────────────────────────────────────────────────
-->

## What does this PR change?

<!--
  2–4 sentences: WHAT changed and WHY.

  Good:  "Adds a BMI calculator to utilities. Supports metric and imperial
          units with instant recalculation on every keystroke. Covers edge
          cases for zero height and extreme values."
  Bad:   "Added new module."
-->

## Type

<!-- Check all that apply -->
- [ ] 🔧 New Utility Tool
- [ ] 🎮 New Minigame
- [ ] 🔌 New API Module
- [ ] 🗂️ New Category
- [ ] ✨ Improvement / Feature
- [ ] 🐛 Bug fix
- [ ] 🧹 Refactor / Cleanup
- [ ] 📚 Docs / Config

## Related Issue

Closes #<!-- issue number, e.g. 42 -->

## Notes for reviewer

<!--
  Optional — skip if the code speaks for itself.
  Use for: non-obvious trade-offs, alternative approaches considered,
  known limitations, or specific areas you want reviewed closely.

  Example: "Chose formula X over Y because Y breaks for negative Celsius values."
-->

## Checklist

<!-- All boxes must be checked before requesting review -->
- [ ] `meta.ts` created with correct metadata
- [ ] Module registered in `src/lib/registry.ts`
- [ ] Module added to `componentMap` in `src/app/[category]/[slug]/page.tsx`
- [ ] Tests written and all green (`npm run test`)
- [ ] E2E test written and green (`npm run test:e2e`)
- [ ] TypeScript check passes (`npm run typecheck`)
- [ ] Build passes (`npm run build`)
- [ ] Netlify preview checked
- [ ] No secrets / API keys in code
- [ ] Documentation updated (README, `docs/` if relevant)
