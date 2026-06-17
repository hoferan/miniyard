# Infrastructure Plan

This document tracks non-feature infrastructure, CI, framework, and refactor work.
Update the status column as issues are completed. Use this file to orient new Claude sessions.

## Status legend

| Symbol | Meaning |
|---|---|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done |
| ❌ | Won't fix / closed as not planned |

---

## Tier 1 — Quick wins (do first)

| Status | Issue | Title | Notes |
|---|---|---|---|
| 🔄 | [#84](https://github.com/hoferan/miniyard/issues/84) | ESLint 10 + eslint-config-next 16 coordinated upgrade | **Blocked** — two upstream blockers confirmed: (1) `eslint-plugin-react@7.37.5` calls `context.getFilename()` removed in ESLint 10; (2) `@codecov/nextjs-webpack-plugin@2.0.1` caps peer dep at Next.js 15. Re-evaluate when both upstream packages ship fixes. Dependabot PRs #29 and #52 were closed. See also #87. |
| 🔄 | [#87](https://github.com/hoferan/miniyard/issues/87) | Migrate from Webpack to Turbopack for production builds | **Blocked** — `@codecov/nextjs-webpack-plugin` has no Turbopack equivalent yet. Small effort once unblocked: remove `--webpack` flag and Webpack config block from `next.config.ts`. Monitor Codecov releases. |
| ✅ | [#43](https://github.com/hoferan/miniyard/issues/43) | Add CONTRIBUTING.md, trim README, add `.vscode/launch.json` | Done — PR #88 |
| ✅ | [#35](https://github.com/hoferan/miniyard/issues/35) | Externalize user-facing strings into per-module `messages.ts` | Done — PR #89; convention documented in CLAUDE.md + utilities README; Base64 module migrated |

---

## Tier 2 — Medium effort, high value

| Status | Issue | Title | Notes |
|---|---|---|---|
| ❌ | [#28](https://github.com/hoferan/miniyard/issues/28) | Breadcrumbs on category listing pages | **Won't fix** — nav already highlights the active category; breadcrumb redundant at depth-2. Closed as not planned. |
| ✅ | [#22](https://github.com/hoferan/miniyard/issues/22) | Unit Converter: swap button + prevent duplicate units | Done — PR #91; swap button carries result as new input; duplicate units auto-advance the other side |
| ✅ | [#58](https://github.com/hoferan/miniyard/issues/58) | Brand identity — favicon, app icons, visual theme | Done — PR #92 |
| ✅ | [#20](https://github.com/hoferan/miniyard/issues/20) | PWA support (manifest, service worker, offline page) | Done — PR #94 |

---

## Tier 3 — Large / architectural (do last, in order)

| Status | Issue | Title | Notes |
|---|---|---|---|
| ⬜ | [#83](https://github.com/hoferan/miniyard/issues/83) | Migrate Tailwind CSS v3 → v4 | Breaking change; verify shadcn/ui compatibility; own branch, own PR |
| ⬜ | [#36](https://github.com/hoferan/miniyard/issues/36) | App-wide i18n infrastructure | Depends on #35 (done); large scope, treat as its own sprint |

---

## Suggested execution order

```text
#84 → #43 → #35 → #22 → #58 → #20 → #83 → #36
```

Remaining as of 2026-06-17: **`#83 → #36`**. Both `#84` and `#87` are blocked on upstream; no action until their respective packages ship Turbopack / ESLint 10 support.

---

## Out of scope for this plan (tracked separately)

New modules and UX features are deliberately excluded here. Open issues in that space:

- **New utilities:** #69 #70 #71 #72 #73 #74 #75 #76 #77 #16
- **New games:** #78 #79 #80
- **UX features:** #11 (tag filtering), #81 (global search)
