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
| [Password Strength Checker](src/modules/utilities/password-strength-checker) | Score any password against six security rules with instant color-coded feedback — fully client-side. |
| [Color Converter](src/modules/utilities/color-converter) | Convert colors between HEX, RGB, and HSL with alpha support — synced in real time with a live preview swatch. |
| [Text Case Converter](src/modules/utilities/text-case-converter) | Convert text between UPPER CASE, camelCase, snake_case, and more — all at once. |

### 🎮 Games
<!-- Add games here as they are built -->
| Game | Description |
|------|-------------|
| [Memory Card Matching](src/modules/games/memory-card) | Flip cards two at a time to find all 8 emoji pairs. Beat your best move count! |
| [Typing Speed Test](src/modules/games/typing-speed-test) | Type a random passage as fast and accurately as you can in 60 seconds. Track your WPM and accuracy. |
| [Reaction Time Test](src/modules/games/reaction-time-test) | Wait for the screen to flash green, then tap as fast as you can. Track your best reaction time. |
| [Snake](src/modules/games/snake) | Steer a growing snake around the grid to eat pellets. Avoid the walls and your own tail — beat your high score. |
| [Colour Sequence Memory](src/modules/games/colour-sequence-memory) | Watch the flashing colour sequence, then repeat it by tapping the tiles in order. Each round adds one more step — how long can you remember? |

### 🔌 APIs
<!-- Add API-powered modules here as they are built -->
| Module | Description |
|------|-------------|
| [Currency Converter](src/modules/apis/currency-converter) | Convert an amount between currencies using live European Central Bank reference rates from the keyless Frankfurter API. |
| [Random Joke](src/modules/apis/random-joke) | Fetch a random joke by category from the keyless JokeAPI, with a safe-mode filter and tap-to-reveal punchlines. |

---

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript
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
git clone https://github.com/hoferan/miniyard.git
npm install
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup details, environment variables, and development workflow.

---

## License

MIT
