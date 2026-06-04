# miniyard

A modular playground with useful tools, mini games, API explorers, and Swiss-specific tools — built with Next.js, React, and Tailwind CSS.

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

### 🔌 API Explorers
<!-- Add explorers here as they are built -->
| Explorer | API | Docs |
|----------|-----|------|
| *(none yet)* | | |

### 🇨🇭 Swiss
<!-- Add Swiss modules here as they are built -->
| Module | Description |
|--------|-------------|
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
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Sentry DSN for error tracking |

Add API keys for explorers as needed — see `.env.example`.

---

## Development Workflow

New modules follow a structured workflow:

```
Brainstorm → Spec (confirmed) → Tests first (TDD) → Implement → Register → Docs → PR
```

All changes go through PRs — no direct pushes to `main`.

### Claude Code Slash Commands

| Command | Description |
|---------|-------------|
| `/new-utility-tool` | New calculator, converter, or text tool |
| `/new-minigame` | New browser-based game |
| `/new-api-explorer` | New hands-on API demo |
| `/new-swiss-module` | New Swiss-specific tool or reference |
| `/bugfix` | Structured bug fix workflow |
| `/update-docs` | Check and update all documentation |
| `/pr-summary` | Generate PR description from git diff |

---

## Project Structure

```
src/
  modules/
    utilities/  # Utility tools  (meta.ts + logic.ts + logic.test.ts + index.tsx)
    games/      # Minigames       (meta.ts + logic.ts + logic.test.ts + index.tsx)
    apis/       # API Explorers   (meta.ts + api.ts   + api.test.ts   + index.tsx)
    swiss/      # Swiss modules   (meta.ts + logic.ts or api.ts + test + index.tsx)
  app/          # Next.js App Router pages
  components/   # Shared UI components
  lib/          # registry.ts, types.ts, utils.ts
tests/
  e2e/          # Playwright E2E tests
docs/
  utilities/    # Per-module documentation (complex tools)
  apis/         # Per-explorer documentation
  swiss/        # Per-Swiss-module documentation
```

---

## License

MIT
