# miniyard

A modular playground with useful tools, mini games, and API explorers — built with Next.js, React, and Tailwind CSS.

## Categories

### 🔧 Utility Tools
<!-- Add tools here as they are built -->
| Tool | Description |
|------|-------------|
| *(none yet)* | |

### 🎮 Minigames
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| *(none yet)* | |

### 🔌 API Explorers
<!-- Add explorers here as they are built -->
| Explorer | API | Docs |
|----------|-----|------|
| *(none yet)* | | |

---

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
- [Sentry](https://sentry.io/) – Error Tracking
- [Netlify](https://netlify.com/) – Hosting + PR Previews
- [CodeRabbit](https://coderabbit.ai/) – AI Code Review
- [Dependabot](https://docs.github.com/en/code-security/dependabot) – Dependency Updates

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Sentry DSN for error tracking |

---

## Development Workflow

New tools and features follow a structured workflow:

```
Brainstorm → Spec (confirmed) → Tests first (TDD) → Implement → Docs → PR
```

All changes go through PRs — no direct pushes to `main`.

### Claude Code Slash Commands

| Command | Description |
|---------|-------------|
| `/new-utility-tool` | New calculator, converter, or text tool |
| `/new-minigame` | New browser-based game |
| `/new-api-explorer` | New hands-on API demo |
| `/bugfix` | Structured bug fix workflow |
| `/update-docs` | Check and update all documentation |
| `/pr-summary` | Generate PR description from git diff |

---

## Project Structure

```
src/
  tools/        # Utility tools  (logic.ts + logic.test.ts + index.tsx)
  games/        # Minigames       (logic.ts + logic.test.ts + index.tsx)
  explorers/    # API Explorers   (api.ts   + api.test.ts   + index.tsx)
  components/   # Shared UI components
  lib/          # Shared utilities
docs/
  tools/        # Per-tool documentation (complex tools & API explorers)
```

---

## License

MIT
