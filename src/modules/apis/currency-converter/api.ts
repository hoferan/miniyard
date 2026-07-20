import type { Currency, RateResult } from './logic'

const BASE = '/api/apis/currency-converter'

export async function fetchCurrencies(): Promise<Currency[]> {
  try {
    const res = await fetch(`${BASE}?op=currencies`)
    if (!res.ok) throw new Error('currencyLoad')
    return (await res.json()) as Currency[]
  } catch {
    throw new Error('currencyLoad')
  }
}

export async function fetchRate(from: string, to: string): Promise<RateResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  } catch {
    throw new Error('network')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'upstream')
  }
  return (await res.json()) as RateResult
}
