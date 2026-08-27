# Spec: Random Joke

Issue: [#149](https://github.com/hoferan/miniyard/issues/149)
Category: `apis`
Date: 2026-08-27

## Function

Fetch and display a random joke from JokeAPI, filtered by category and an
optional safe-mode toggle, with a button to fetch another. Two-part jokes hide
the punchline behind a tap so the comedic beat survives.

## External API

- **Service:** JokeAPI v2 — `https://v2.jokeapi.dev`
- **Key required:** No. Public and keyless.
- **Proxied:** Yes. The `apis` category README makes a same-origin Route
  Handler the house rule for every module, and the proxy is where upstream
  status codes are normalised into stable error keys.
- **Rate limit:** 120 requests/minute per IP. Well clear of one-joke-per-tap
  usage; no debounce or client cache needed.
- **Caching:** The proxy fetches with `cache: 'no-store'`. Caching would
  defeat the feature by serving the same "random" joke repeatedly. This is a
  deliberate difference from `currency-converter`, which does cache.
- **Attribution:** Not required by JokeAPI's licence, but shown anyway for
  consistency with `currency-converter`.

## Inputs

| Input | Type | Validation |
|---|---|---|
| Category | `'Any' \| 'Programming' \| 'Misc' \| 'Pun'` | `isValidCategory` guards the proxy query param; unknown values → HTTP 400 `invalid_category` |
| Safe mode | `boolean` | Any truthy query value is coerced; defaults to `true` |

Neither control auto-fetches. Both apply to the next "Another joke" press.

## Outputs

A single joke, in one of two shapes:

```ts
type Joke =
  | { type: 'single';  text: string;                   category: string }
  | { type: 'twopart'; setup: string; delivery: string; category: string }
```

## Logic / Algorithm

`logic.ts` is pure — no fetch, no React, no DOM:

- `CATEGORIES` — the four selectable categories.
- `isValidCategory(value): value is JokeCategory` — guards untrusted input.
- `buildUpstreamPath(category, safeMode): string` — builds the JokeAPI path
  and appends the valueless `safe-mode` flag when enabled.
- `parseJoke(raw: unknown): Joke` — normalises both response shapes into the
  union above; throws on error payloads and malformed input.
- `isTwoPart(joke): joke is TwoPartJoke` — type guard driving the reveal button.

## Edge Cases

- **JokeAPI returns HTTP 200 with `{"error": true}`.** `res.ok` alone is not a
  success check; `parseJoke` inspects the `error` field. This is the single
  most important correctness detail in the module.
- **Code 106 — "No matching joke found."** Reachable when safe-mode plus a
  narrow category filters everything out. Gets its own message, not a generic
  failure.
- **HTTP 429 — rate limited.** Distinct message telling the user to wait.
- **Malformed payload** — missing `joke`/`setup`/`delivery`, or a `type` that
  is neither `single` nor `twopart` → throws, surfaces as `upstream`.
- **Missing `category`** — defaults to an empty string; the UI simply omits
  the category badge rather than failing the whole joke.
- **Network failure** — proxy catch, `Sentry.captureException`, `network` key.
- **Punchline state resets** on every new fetch, so a revealed punchline never
  leaks into the next joke.

## UI States

1. **Idle/loading** — skeleton while a request is in flight; the button is
   disabled and shows loading copy.
2. **Single joke** — the text in a card, "Another joke" beneath.
3. **Two-part joke** — the setup plus a "Show punchline" button; tapping
   swaps in the delivery.
4. **Error** — destructive `Alert` with copy from `messages.ts`; the retry
   button stays available.

Mobile-first: single column, full-width controls, thumb-reachable buttons.

## Error Key Mapping

| Condition | Key |
|---|---|
| `429` | `rateLimited` |
| `error: true`, code `106` | `noMatch` |
| Other `error: true` / non-OK / parse throw | `upstream` |
| Fetch rejection in the proxy | `network` |
| Unknown category query param | `invalid_category` |

## New Files

- `src/modules/apis/random-joke/meta.ts`
- `src/modules/apis/random-joke/logic.ts`
- `src/modules/apis/random-joke/logic.test.ts`
- `src/modules/apis/random-joke/messages.ts`
- `src/modules/apis/random-joke/api.ts`
- `src/modules/apis/random-joke/index.tsx`
- `src/app/api/apis/random-joke/route.ts`
- `tests/e2e/random-joke.spec.ts`

## Registration

- `src/lib/registry.ts` — add `randomJokeMeta`
- `src/components/apis-module-content.tsx` — add to `componentMap`
- `src/lib/icons.ts` — add `laugh` → lucide `Laugh`

## Documentation

- `README.md` — add to the APIs module table
- `.lighthouserc.json` — **not** updated. No `apis` module page is listed
  there today (`currency-converter` is absent too); only the `/apis` listing
  page is. Adding a module page would put a live third-party call on the
  Lighthouse CI path and make the run flaky. Following the existing
  convention instead.

No `docs/apis/random-joke.md`: the logic is small and the spec covers it.

## Testing

- **Unit (`logic.test.ts`, written red first):** both response shapes, the
  `error: true`-with-200 case, code 106, malformed payloads, category
  validation, and path building with safe-mode on and off.
- **E2E (`tests/e2e/random-joke.spec.ts`):** mocks `**/api/apis/random-joke**`
  — never hits the real API — and covers fetch → reveal punchline → fetch
  another, plus the error state. Includes `page.screenshot()`.

## Verification Limitation

The live JokeAPI response shape could not be probed from the development
container: the environment's network policy rejects `v2.jokeapi.dev` at the
proxy with a 403. The implementation follows JokeAPI v2's documented contract,
and all tests mock the proxy as the category README requires. Behaviour against
the real upstream should be confirmed on the Netlify preview deploy.
