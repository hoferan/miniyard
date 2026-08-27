export const CATEGORIES = ['Any', 'Programming', 'Misc', 'Pun'] as const

export type JokeCategory = (typeof CATEGORIES)[number]

export type SingleJoke = { type: 'single'; text: string; category: string }
export type TwoPartJoke = { type: 'twopart'; setup: string; delivery: string; category: string }
export type Joke = SingleJoke | TwoPartJoke

/** JokeAPI signals "no joke matched your filters" with this code on an HTTP 200. */
const NO_MATCH_CODE = 106

export function isValidCategory(value: unknown): value is JokeCategory {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

export function buildUpstreamPath(category: JokeCategory, safeMode: boolean): string {
  const path = `/joke/${encodeURIComponent(category)}`
  // JokeAPI expects `safe-mode` as a valueless flag, not `safe-mode=true`.
  return safeMode ? `${path}?safe-mode` : path
}

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key]
  if (typeof value !== 'string' || value.trim() === '') return null
  return value
}

/**
 * Normalises a JokeAPI response into a Joke.
 *
 * JokeAPI answers failures with HTTP 200 and an `error: true` body, so a
 * response being "ok" is never enough — the body decides. Throws an Error
 * whose message is the error key the UI shows.
 */
export function parseJoke(raw: unknown): Joke {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('upstream')
  const payload = raw as Record<string, unknown>

  if (payload.error === true) {
    throw new Error(payload.code === NO_MATCH_CODE ? 'noMatch' : 'upstream')
  }

  const category = typeof payload.category === 'string' ? payload.category : ''

  if (payload.type === 'single') {
    const text = readString(payload, 'joke')
    if (text === null) throw new Error('upstream')
    return { type: 'single', text, category }
  }

  if (payload.type === 'twopart') {
    const setup = readString(payload, 'setup')
    const delivery = readString(payload, 'delivery')
    if (setup === null || delivery === null) throw new Error('upstream')
    return { type: 'twopart', setup, delivery, category }
  }

  throw new Error('upstream')
}

export function isTwoPart(joke: Joke): joke is TwoPartJoke {
  return joke.type === 'twopart'
}
