---
name: testing-anti-patterns
description: Use when writing tests, adding mocks, or reviewing test code to avoid common mistakes that reduce test value.
---

# Testing Anti-Patterns

## Mocking anti-patterns

**Over-mocking** — mocking functions within the module under test. Only mock external boundaries: network, filesystem, time, third-party services. If you are mocking a function defined in the file you are testing, you are testing nothing.

**Brittle mocks** — mocks that break when implementation changes but observable behavior does not. Mock the interface (what goes in / what comes out), not the internal call sequence.

**Missing cleanup** — mocks that bleed between tests. Always restore mocks in `afterEach` / `afterAll`. Prefer `vi.restoreAllMocks()` over manual cleanup.

**Mocking without understanding** — adding a mock to make an import resolve without knowing what that dependency does. Understand the dependency first.

## Assertion anti-patterns

**Testing implementation, not behavior** — `expect(innerFn).toHaveBeenCalled()` when you should assert on the observable output. Tests should describe what users and callers observe.

**Weak assertions** — `expect(x).toBeTruthy()` or `expect(result).toBeDefined()` when a specific value check is possible. Weak assertions pass even when the code is wrong.

**Snapshot everything** — snapshots on volatile output (timestamps, random IDs, generated keys). Snapshots are useful for stable, complex structures. For dynamic values, use targeted property assertions.

**One assertion per test (taken too far)** — splitting logically related assertions into dozens of tests with identical setup. Related assertions on one piece of behavior can live in one test.

## Test structure anti-patterns

**One test, many unrelated scenarios** — a loop over 10 unrelated inputs in one `it`. Use `it.each` so failures identify the specific failing input.

**Logic in tests** — `if`, `switch`, or `for` in test bodies. A test that branches is two tests pretending to be one; the branch that never runs hides the bug.

**Order-dependent tests** — tests that only pass when run after another test. Each test must set up its own state independently.

**Setup that hides intent** — critical values buried in `beforeEach` that are essential to understand what a test verifies. Make the relevant inputs visible at the test level, even if it means repeating setup.

## Playwright / E2E anti-patterns

**Sleeping instead of waiting** — `await page.waitForTimeout(1000)` instead of `await expect(locator).toBeVisible()`. Time-based waits are fragile and slow. Use condition-based waiting.

**Testing internal state** — asserting React state, component props, or DOM IDs instead of what a user sees or hears. Test through accessible roles and labels.

**Fragile selectors** — CSS class names, array indices, or XPaths. Prefer `getByRole`, `getByLabel`, `getByText` so tests survive refactors.

**Asserting the wrong thing on success** — checking that an error does not appear instead of checking that the success state does. Assert the presence of the expected outcome.
