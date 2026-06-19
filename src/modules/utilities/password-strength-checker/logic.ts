export type CheckKey =
  | 'MIN_LENGTH_8'
  | 'MIN_LENGTH_12'
  | 'HAS_UPPERCASE'
  | 'HAS_DIGIT'
  | 'HAS_SPECIAL'
  | 'NO_COMMON_PATTERN'

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

export interface StrengthResult {
  score: number
  level: StrengthLevel
  failedChecks: CheckKey[]
}

const COMMON_PATTERNS = ['123', '321', 'abc', 'qwerty', 'password', 'letmein', 'iloveyou']

function scoreToLevel(score: number): StrengthLevel {
  if (score <= 1) return 0
  if (score === 2) return 1
  if (score === 3) return 2
  if (score === 4) return 3
  return 4
}

export function checkPassword(password: string): StrengthResult {
  const lower = password.toLowerCase()

  const checks: Array<{ key: CheckKey; passes: boolean }> = [
    { key: 'MIN_LENGTH_8', passes: password.length >= 8 },
    { key: 'MIN_LENGTH_12', passes: password.length >= 12 },
    { key: 'HAS_UPPERCASE', passes: /[A-Z]/.test(password) },
    { key: 'HAS_DIGIT', passes: /[0-9]/.test(password) },
    { key: 'HAS_SPECIAL', passes: /[^a-zA-Z0-9]/.test(password) },
    { key: 'NO_COMMON_PATTERN', passes: password.length > 0 && !COMMON_PATTERNS.some((p) => lower.includes(p)) },
  ]

  const score = checks.filter((c) => c.passes).length
  const level = scoreToLevel(score)
  const failedChecks = checks.filter((c) => !c.passes).map((c) => c.key)

  return { score, level, failedChecks }
}
