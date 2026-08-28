import { PLACEHOLDER, DIRECTION_WORDS } from './messages'

/** Number of decimal places every displayed result is rounded to. */
const DECIMAL_PLACES = 2

export type ChangeDirection = 'increase' | 'decrease' | 'none'

export type ChangeDescription = {
  text: string
  direction: ChangeDirection
}

function isUsable(...values: number[]): boolean {
  return values.every((value) => Number.isFinite(value))
}

/** What is `percentage`% of `value`? */
export function percentOf(percentage: number, value: number): number | null {
  if (!isUsable(percentage, value)) return null
  return (percentage / 100) * value
}

/** `value` is what percent of `base`? */
export function whatPercent(value: number, base: number): number | null {
  if (!isUsable(value, base)) return null
  if (base === 0) return null
  return (value / base) * 100
}

/** Percentage change from `oldValue` to `newValue`, relative to the magnitude of `oldValue`. */
export function percentChange(oldValue: number, newValue: number): number | null {
  if (!isUsable(oldValue, newValue)) return null
  if (oldValue === 0) return null
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100
}

/** Rounds to two decimals and strips trailing zeros; `null` becomes the placeholder. */
export function formatResult(value: number | null): string {
  if (value === null) return PLACEHOLDER
  const rounded = Number(value.toFixed(DECIMAL_PLACES))
  // toFixed rounds, Number() then drops the trailing zeros. Normalising -0 to 0 keeps
  // a rounded-away negative from rendering as "-0".
  return String(rounded === 0 ? 0 : rounded)
}

/** Turns a change percentage into display text plus a direction for styling. */
export function describeChange(change: number | null): ChangeDescription {
  if (change === null) return { text: PLACEHOLDER, direction: 'none' }

  const rounded = Number(change.toFixed(DECIMAL_PLACES))

  if (rounded === 0) {
    return { text: `0% — ${DIRECTION_WORDS.none}`, direction: 'none' }
  }

  if (rounded > 0) {
    return { text: `+${rounded}% ${DIRECTION_WORDS.increase}`, direction: 'increase' }
  }

  return { text: `−${Math.abs(rounded)}% ${DIRECTION_WORDS.decrease}`, direction: 'decrease' }
}
