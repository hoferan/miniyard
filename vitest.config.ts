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
      junit: './test-report.junit.xml',
    },
    coverage: {
      provider: 'v8',
      include: ['src/modules/**/logic.ts'],
      reporter: ['text', 'html', 'json-summary', 'json', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      thresholds: {
        perFile: true,
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
