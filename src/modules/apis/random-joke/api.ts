import type { Joke, JokeCategory } from './logic'

const BASE = '/api/apis/random-joke'

export async function fetchJoke(category: JokeCategory, safeMode: boolean): Promise<Joke> {
  const params = new URLSearchParams({ category, safeMode: String(safeMode) })

  let res: Response
  try {
    res = await fetch(`${BASE}?${params}`, { cache: 'no-store' })
  } catch {
    throw new Error('network')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'upstream')
  }

  return (await res.json()) as Joke
}
