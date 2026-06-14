[![Netlify Status](https://api.netlify.com/api/v1/badges/8dfeaeee-8e4c-4545-abda-17511c8a3830/deploy-status)](https://app.netlify.com/projects/miniyard/deploys)
[![CI](https://github.com/hoferan/miniyard/actions/workflows/main.yml/badge.svg)](https://github.com/hoferan/miniyard/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/hoferan/miniyard/graph/badge.svg)](https://codecov.io/gh/hoferan/miniyard)

# miniyard

A modular playground with useful tools and mini games — built with Next.js, React, and Tailwind CSS. Starts small and grows over time.

## Categories

### 🔧 Utilities
<!-- Add utility tools here as they are built -->
| Tool | Description |
|------|-------------|
| [Unit Converter](src/modules/utilities/unit-converter) | Convert between common units: length, weight, temperature, and volume. |
| [Base64 Encoder / Decoder](src/modules/utilities/base64-converter) | Encode text to Base64 or decode Base64 back to text — fully client-side. |

### 🎮 Games
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| [Memory Card Matching](src/modules/games/memory-card) | Flip cards two at a time to find all 8 emoji pairs. Beat your best move count! |

---

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/) – Unit testing
- [Playwright](https://playwright.dev/) – E2E testing
- [Sentry](https://sentry.io/) – Error Tracking
- [Netlify](https://netlify.com/) – Hosting + PR Previews
- [GitHub Actions](https://github.com/features/actions) – CI/CD
- [Codecov](https://codecov.io/) – Coverage tracking + bundle analysis
- [CodeRabbit](https://coderabbit.ai/) – AI Code Review
- [Dependabot](https://docs.github.com/en/code-security/dependabot) – Dependency Updates

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Sentry DSN for error tracking (public, safe to commit) |
| `SENTRY_AUTH_TOKEN` | Build only | Sentry auth token for source map upload — set in Netlify dashboard, never commit |
| `CODECOV_TOKEN` | CI only | Codecov token for coverage and bundle analysis upload — set as GitHub Actions secret |

---

## Deployment

The app is deployed on [Netlify](https://netlify.com/).

| Environment | URL |
|-------------|-----|
| Production (`main`) | <https://miniyard.netlify.app/> |
| PR Preview | `https://deploy-preview-{pr-number}--miniyard.netlify.app/` |

Netlify auto-detects Next.js and runs `npm run build` with `@netlify/plugin-nextjs`.

### Required environment variables in Netlify dashboard

Set these under **Site configuration → Environment variables**:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (same value as in `.env.example`) |
| `SENTRY_AUTH_TOKEN` | Secret token for Sentry source map upload |

### Required GitHub Actions secrets

Set these under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `CODECOV_TOKEN` | Codecov repository token — get it from [app.codecov.io](https://app.codecov.io) → your repo → Settings |

---

## Development Workflow

New modules follow a structured workflow:

```text
Brainstorm → Spec (confirmed) → Tests first (TDD) → Implement → Register → Docs → PR
```

All changes go through PRs — no direct pushes to `main`.

### Claude Code Slash Commands

| Command | Description |
|---------|-------------|
| `/new-module` | New module in any category (reads category README automatically) |
| `/new-category` | Add an entirely new module category |
| `/bugfix` | Structured bug fix workflow |
| `/update-docs` | Check and update all documentation |
| `/pr-summary` | Generate PR description from git diff |
| `/review-threads` | Interactive review of all open PR threads — CodeRabbit, human reviewers, and your own |

---

## Project Structure

```text
src/
  modules/
    utilities/  # Utility tools  (meta.ts + logic.ts + logic.test.ts + index.tsx)
    games/      # Minigames       (meta.ts + logic.ts + logic.test.ts + index.tsx)
  app/          # Next.js App Router pages
  components/   # Shared UI components
  lib/          # registry.ts, types.ts, utils.ts
tests/
  e2e/          # Playwright E2E tests
docs/           # Per-module documentation (complex modules only)
```

---

## License

MIT
