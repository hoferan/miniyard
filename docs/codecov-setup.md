# Codecov Setup Guide

Full reference for integrating Codecov (coverage reports, test results, and bundle analysis) into a Next.js 15 + Vitest project hosted on GitHub with GitHub Actions CI.

## What this covers

- Coverage upload (lcov) via GitHub Actions
- Test results upload (JUnit XML) via GitHub Actions
- Bundle analysis via the Codecov webpack plugin
- `codecov.yml` configuration (thresholds, components, PR comments)

---

## 1. GitHub secret

Add `CODECOV_TOKEN` as a repository secret in **Settings → Secrets and variables → Actions**.

Get the token from [codecov.io](https://codecov.io) after connecting your repository.

---

## 2. npm packages

```bash
npm install --save-dev @codecov/nextjs-webpack-plugin@2.0.1 @vitest/coverage-v8@4.1.9
```

Pin exact versions — no `^` or `~`.

---

## 3. Vitest config (`vitest.config.ts`)

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-report.junit.xml',   // required for test results upload
    },
    coverage: {
      provider: 'v8',
      include: ['src/modules/**/logic.ts'], // adjust to your source paths
      reporter: ['text', 'html', 'json-summary', 'json', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Key points:

- `reporter: ['junit']` + `outputFile.junit` → produces `test-report.junit.xml` for the test results upload
- `coverage.reporter` must include `'lcov'` → produces `coverage/lcov.info` for the coverage upload
- `coverage.provider: 'v8'` requires `@vitest/coverage-v8`

Add the npm script:

```json
"test:coverage": "vitest run --coverage"
```

---

## 4. Next.js bundle analysis (`next.config.ts`)

```ts
import type { NextConfig } from 'next'
import { codecovNextJSWebpackPlugin } from '@codecov/nextjs-webpack-plugin'

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: !!process.env.CODECOV_TOKEN,
        bundleName: 'miniyard',           // replace with your project name
        uploadToken: process.env.CODECOV_TOKEN,
        webpack: options.webpack,
      })
    )
    return config
  },
}

export default nextConfig
```

`enableBundleAnalysis: !!process.env.CODECOV_TOKEN` ensures the plugin is a no-op locally (where `CODECOV_TOKEN` is not set) and active in CI.

The bundle stats are uploaded automatically during `next build` when `CODECOV_TOKEN` is present as an env var.

---

## 5. `codecov.yml`

Place this file at the repository root.

```yaml
coverage:
  precision: 2
  round: down
  range: "70...100"

  status:
    project:
      default:
        target: 80%
        threshold: 1%
    patch:
      default:
        target: auto
        threshold: 1%

component_management:
  default_rules:
    statuses:
      - type: project
        target: auto
        branches:
          - "!main"
  individual_components:
    - component_id: module_utilities
      name: utilities
      paths:
        - src/modules/utilities/**
    - component_id: module_games
      name: games
      paths:
        - src/modules/games/**
    - component_id: module_app
      name: app
      paths:
        - src/app/**
        - src/components/**
        - src/lib/**

comment:
  layout: "reach,diff,flags,tree"
  behavior: default
  require_changes: false
```

Adjust `component_management.individual_components` paths to match your directory structure.

---

## 6. GitHub Actions workflow steps

These steps belong inside the job that runs unit tests. Pinned action SHAs are the versions used at the time of writing — update to newer pinned SHAs as needed.

```yaml
- name: Unit tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@fb8b3582c8e4def4969c97caa2f19720cb33a72f # v7
  if: ${{ !cancelled() }}
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: false

- name: Upload test results to Codecov
  uses: codecov/codecov-action@fb8b3582c8e4def4969c97caa2f19720cb33a72f # v7
  if: ${{ !cancelled() }}
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    report_type: test_results
    files: ./test-report.junit.xml
    disable_search: true
    fail_ci_if_error: false
```

For bundle analysis, pass the token as an env var to the build step:

```yaml
- name: Build
  run: npm run build
  env:
    CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

### Why `if: ${{ !cancelled() }}`

Uploading on `if: !cancelled()` instead of `if: always()` ensures the upload runs even when previous steps fail (so partial coverage is still reported), but skips it when the job is manually cancelled.

### Why `fail_ci_if_error: false`

Codecov upload failures (network issues, token problems) should not block the PR. Coverage is informational, not a hard gate.

---

## 7. Files produced and consumed

| File | Produced by | Consumed by |
|---|---|---|
| `coverage/lcov.info` | `vitest run --coverage` | coverage upload step |
| `test-report.junit.xml` | `vitest run` (junit reporter) | test results upload step |
| Bundle stats JSON | `next build` (webpack plugin) | bundle analysis upload (automatic) |

---

## 8. What shows up in PRs

After this setup, each PR receives:

- A Codecov comment with coverage diff, patch coverage, and the component breakdown
- Test results tab on the Codecov PR page (pass/fail/flaky per test)
- Bundle analysis tab showing size changes per chunk
