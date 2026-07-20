export type Currency = { code: string; name: string }
export type RateResult = { base: string; quote: string; rate: number; date: string }
export type AmountValidation =
  | { valid: true; value: number }
  | { valid: false; errorKey: 'empty' | 'notNumber' | 'negative' }

export function parseCurrencies(raw: unknown): Currency[] {
  if (!Array.isArray(raw)) throw new Error('Unexpected currencies payload')
  return raw
    .map((entry) => {
      const e = entry as Record<string, unknown>
      return { code: String(e.iso_code ?? ''), name: String(e.name ?? '') }
    })
    .filter((c) => c.code !== '' && c.name !== '' && c.name !== 'undefined')
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function parseRate(raw: unknown): RateResult {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Unexpected rate payload')
  const first = raw[0] as Record<string, unknown>
  const rate = first.rate
  if (typeof rate !== 'number' || !Number.isFinite(rate)) throw new Error('Unexpected rate value')
  return {
    base: String(first.base ?? ''),
    quote: String(first.quote ?? ''),
    rate,
    date: String(first.date ?? ''),
  }
}

export function validateAmount(input: string): AmountValidation {
  const trimmed = input.trim()
  if (trimmed === '') return { valid: false, errorKey: 'empty' }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return { valid: false, errorKey: 'notNumber' }
  if (value < 0) return { valid: false, errorKey: 'negative' }
  return { valid: true, value }
}

export function isSameCurrency(from: string, to: string): boolean {
  return from === to
}

export function convert(amount: number, rate: number): number {
  return amount * rate
}

export function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRate(rate: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(rate)
}
