# Spec: Public Holidays

**Issue:** [#148](https://github.com/hoferan/miniyard/issues/148)
**Category:** apis
**Date:** 2026-08-27

## Function

Pick a country and a year, get that country's public holidays as a
chronological list showing the date, the local name, and the English name.

## External API

[Nager.Date](https://date.nager.at) v3 — public, keyless, no rate limit that
affects UX.

| Op | Upstream endpoint | Cache |
|---|---|---|
| Country list | `GET /api/v3/AvailableCountries` | `revalidate: 86400` |
| Holidays | `GET /api/v3/PublicHolidays/{year}/{countryCode}` | `revalidate: 86400` |

Both are proxied through a same-origin Route Handler, per the `apis` category
convention. No API key is involved, so nothing is added to `.env.example`.

> **Note on verification:** `date.nager.at` is blocked by the network policy of
> the container this module was built in, so the upstream response shape below
> is taken from Nager.Date's published v3 documentation rather than a live
> probe. `parseCountries` and `parseHolidays` are written defensively for that
> reason: they validate every field they read and skip entries that do not
> match, so an unexpected upstream shape degrades instead of crashing.

### Upstream shapes

```ts
// AvailableCountries
[{ countryCode: 'AT', name: 'Austria' }]

// PublicHolidays/{year}/{country}
[{
  date: '2026-01-01',
  localName: 'Neujahr',
  name: "New Year's Day",
  countryCode: 'AT',
  fixed: false,
  global: true,
  counties: null,
  launchYear: null,
  types: ['Public'],
}]
```

An unsupported country code or year answers `404`.

## Inputs

| Input | Type | Validation |
|---|---|---|
| Country | ISO 3166-1 alpha-2 string | `^[A-Z]{2}$` — also blocks path injection into the upstream URL |
| Year | integer | Within `currentYear - 5 … currentYear + 5` |

Both are chosen from `Select` dropdowns, so invalid values cannot be produced
by the UI. The proxy validates anyway — it is a public endpoint.

## Outputs

A list of `{ date, localName, name }`, sorted by date ascending. The client
never sees the raw upstream payload; the proxy normalises it.

## Logic / Algorithm

All of the following live in `logic.ts` as pure functions — no React, no DOM,
no `fetch`.

| Function | Purpose |
|---|---|
| `buildYearOptions(currentYear)` | `currentYear - 5 … currentYear + 5`, ascending — keeps the year range out of the UI as a hardcoded list |
| `isValidCountryCode(value)` | `^[A-Z]{2}$` |
| `isValidYear(value, currentYear)` | Integer inside the range above |
| `parseCountries(raw)` | → `Country[]` sorted by name; throws `upstream` when `raw` is not an array |
| `parseHolidays(raw)` | → `Holiday[]` sorted by date; skips malformed entries; throws `upstream` when `raw` is not an array |
| `formatHolidayDate(iso)` | UTC-safe display string, e.g. `Thu, 1 Jan 2026` |
| `findNextHolidayIndex(holidays, todayIso)` | Index of the first holiday on or after `todayIso`, else `-1` |
| `isPastHoliday(dateIso, todayIso)` | `dateIso < todayIso` |

### The UTC trap

`new Date('2026-01-01')` parses as **UTC midnight**. Formatted with a local
timezone at a negative offset, that renders as *31 Dec 2025* — the module
would show every holiday one day early for users in the Americas.

A public holiday is a calendar date, not an instant. `formatHolidayDate`
therefore splits the ISO string into its parts, builds the date with
`Date.UTC(...)`, and formats with `timeZone: 'UTC'`. `findNextHolidayIndex`
and `isPastHoliday` compare ISO strings lexicographically and never construct
a `Date` at all. This has an explicit unit test.

## Data flow

```text
index.tsx  →  api.ts  →  /api/apis/public-holidays  →  date.nager.at
                              (validates, normalises via logic.ts)
```

## Error handling

Error keys travel as `{ error: '<key>' }` from the proxy; `messages.ts` owns
the copy.

| Key | Cause | HTTP |
|---|---|---|
| `countryLoad` | Country list could not be loaded | any |
| `notFound` | Upstream 404 — country/year combination unsupported | 404 |
| `invalidInput` | Country code or year failed validation | 400 |
| `upstream` | Upstream non-OK, or an unparseable payload | 502 |
| `network` | Proxy could not reach the upstream at all | 502 |

`Sentry.captureException` is called only for genuinely unexpected failures in
the route handler, matching `random-joke`.

## Edge cases

- Country with zero holidays in the selected year → empty state, not an error
- Upstream `404` → `notFound` copy, list cleared
- Malformed entries inside an otherwise valid array → skipped, rest rendered
- Two holidays on the same date → both listed
- `localName` identical to `name` → the English line is not rendered twice
- Selected year is not the current year → no "Next" badge, no dimming
- All holidays in the current year are in the past → no badge, all dimmed
- Country list fails to load → error shown, year `Select` still usable
- Year boundary: a holiday dated today counts as upcoming, not past

## UI

Mobile-first, shadcn/ui only, no inline styles.

- Country `Select` (populated on mount) and Year `Select` (defaults to the
  current year), stacked on mobile, side by side from `sm:`
- Results as bordered cards: formatted date, local name prominent, English
  name muted below (omitted when identical)
- When the selected year is the current year, the next upcoming holiday gets a
  `Next` badge and past holidays are dimmed via `cn()`
- `Skeleton` rows while a request is in flight, `Alert` for errors
- Attribution link to Nager.Date in the footer of the module

## New files

- `src/modules/apis/public-holidays/meta.ts`
- `src/modules/apis/public-holidays/logic.ts`
- `src/modules/apis/public-holidays/logic.test.ts`
- `src/modules/apis/public-holidays/api.ts`
- `src/modules/apis/public-holidays/messages.ts`
- `src/modules/apis/public-holidays/index.tsx`
- `src/app/api/apis/public-holidays/route.ts`
- `tests/e2e/public-holidays.spec.ts`

## Registration

- `src/lib/registry.ts`
- `src/components/apis-module-content.tsx` (`componentMap`)
- `src/lib/icons.ts` (`calendar-days`)

## Documentation

- `README.md` — APIs module table

## Testing

- `logic.test.ts` — every function above, written red before `logic.ts` exists,
  including the UTC boundary case and the `-1` no-upcoming-holiday case
- `tests/e2e/public-holidays.spec.ts` — mocks both proxy ops, asserts the list
  renders and the `Next` badge appears, includes a `page.screenshot()` call
