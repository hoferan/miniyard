# Contributing to miniyard

## Prerequisites

- Node.js 20.9+
- npm 10+

## First-time setup

```bash
git clone https://github.com/hoferan/miniyard.git
cd miniyard
npm install
cp .env.example .env.local   # fill in values (see Environment Variables below)
git config core.hooksPath .githooks   # activate pre-commit hooks
```

## Running the app

```bash
npm run dev        # dev server on http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
```

### VS Code: F5 to debug

Open the repo in VS Code and press **F5**. The `.vscode/launch.json` launches the dev server and attaches both the Node.js and Chrome debuggers automatically. No manual terminal steps needed.

## Running tests

```bash
npm run test           # unit tests (Vitest) — run once
npm run test:watch     # unit tests in watch mode
npm run test:e2e       # Playwright E2E tests
npm run test:e2e:ui    # Playwright with interactive UI
npm run typecheck      # TypeScript check
npm run lint           # ESLint
npm run lint:md        # Markdown lint (MD040 etc.)
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Sentry DSN for error tracking (public, safe to expose) |
| `SENTRY_AUTH_TOKEN` | Build only | Sentry auth token for source map upload — never commit |
| `CODECOV_TOKEN` | CI only | Codecov token — set as a GitHub Actions secret |

## Branch strategy and PR flow

- `main` is the only long-lived branch. **No direct pushes.**
- Every change goes through a pull request.
- Branch naming: `issue-{n}-short-description` (e.g. `issue-42-bmi-calculator`)
- PRs must pass CI (lint, typecheck, unit tests, build) before merging.
- CodeRabbit reviews every PR automatically — address or dismiss its comments before merging.

## Commit message format

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat:     new feature
fix:      bug fix
test:     adding or updating tests
chore:    tooling, deps, config
docs:     documentation only
refactor: code change that neither fixes a bug nor adds a feature
```

Examples:

```text
feat: add BMI calculator to utilities
fix: prevent duplicate unit selection in converter
docs: update README with new module list
```

## Adding modules and categories

See [CLAUDE.md](CLAUDE.md) for the full module architecture, coding conventions, and the step-by-step workflow for adding new modules and categories. That document is the single source of truth for how the codebase is structured.
