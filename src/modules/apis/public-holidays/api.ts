import type { Country, Holiday } from './logic'

const BASE = '/api/apis/public-holidays'

async function readErrorKey(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  return body.error ?? 'upstream'
}

export async function fetchCountries(): Promise<Country[]> {
  try {
    const res = await fetch(`${BASE}?op=countries`)
    if (!res.ok) throw new Error('countryLoad')
    return (await res.json()) as Country[]
  } catch {
    // Any failure here leaves the picker empty, so the copy is the same either way.
    throw new Error('countryLoad')
  }
}

export async function fetchHolidays(country: string, year: number): Promise<Holiday[]> {
  const params = new URLSearchParams({ country, year: String(year) })

  let res: Response
  try {
    res = await fetch(`${BASE}?${params}`)
  } catch {
    throw new Error('network')
  }

  if (!res.ok) throw new Error(await readErrorKey(res))

  return (await res.json()) as Holiday[]
}
