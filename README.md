[![Netlify Status](https://api.netlify.com/api/v1/badges/8dfeaeee-8e4c-4545-abda-17511c8a3830/deploy-status)](https://app.netlify.com/projects/miniyard/deploys)

# miniyard

A modular playground with useful tools and mini games — built with Next.js, React, and Tailwind CSS. Starts small and grows over time.

## Categories

### 🔧 Utilities
<!-- Add utility tools here as they are built -->
| Tool | Description |
|------|-------------|
| *(none yet)* | |

### 🎮 Games
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| *(none yet)* | |

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
