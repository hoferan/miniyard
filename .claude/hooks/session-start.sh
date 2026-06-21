#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

npm install
npx playwright install chromium || echo "Warning: Playwright browser install failed (cdn.playwright.dev may be blocked). E2E tests will not run."
