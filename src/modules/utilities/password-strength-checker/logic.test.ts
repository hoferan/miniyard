import { describe, it, expect } from 'vitest'
import { checkPassword } from './logic'

describe('checkPassword — empty input', () => {
  it('returns score 0 and level 0 for empty string', () => {
    const result = checkPassword('')
    expect(result.score).toBe(0)
    expect(result.level).toBe(0)
  })

  it('fails all 6 checks for empty string', () => {
    const result = checkPassword('')
    expect(result.failedChecks).toHaveLength(6)
  })
})

describe('checkPassword — MIN_LENGTH_8', () => {
  it('passes for exactly 8 characters', () => {
    const { failedChecks } = checkPassword('Xzwvuts1')
    expect(failedChecks).not.toContain('MIN_LENGTH_8')
  })

  it('fails for 7 characters', () => {
    const { failedChecks } = checkPassword('Xzwvuts')
    expect(failedChecks).toContain('MIN_LENGTH_8')
  })
})

describe('checkPassword — MIN_LENGTH_12', () => {
  it('passes for exactly 12 characters', () => {
    const { failedChecks } = checkPassword('Xzwvutsrqp1!')
    expect(failedChecks).not.toContain('MIN_LENGTH_12')
  })

  it('fails for 11 characters', () => {
    const { failedChecks } = checkPassword('Xzwvutsrqp1')
    expect(failedChecks).toContain('MIN_LENGTH_12')
  })
})

describe('checkPassword — HAS_UPPERCASE', () => {
  it('passes when an uppercase letter is present', () => {
    const { failedChecks } = checkPassword('Xyz')
    expect(failedChecks).not.toContain('HAS_UPPERCASE')
  })

  it('fails when all letters are lowercase', () => {
    const { failedChecks } = checkPassword('xyz')
    expect(failedChecks).toContain('HAS_UPPERCASE')
  })
})

describe('checkPassword — HAS_DIGIT', () => {
  it('passes when a digit is present', () => {
    const { failedChecks } = checkPassword('xyz1')
    expect(failedChecks).not.toContain('HAS_DIGIT')
  })

  it('fails when no digit is present', () => {
    const { failedChecks } = checkPassword('xyzwvuts')
    expect(failedChecks).toContain('HAS_DIGIT')
  })
})

describe('checkPassword — HAS_SPECIAL', () => {
  it('passes for ! character', () => {
    const { failedChecks } = checkPassword('xyz!')
    expect(failedChecks).not.toContain('HAS_SPECIAL')
  })

  it('passes for @ character', () => {
    const { failedChecks } = checkPassword('xyz@')
    expect(failedChecks).not.toContain('HAS_SPECIAL')
  })

  it('fails for alphanumeric-only input', () => {
    const { failedChecks } = checkPassword('xyz123')
    expect(failedChecks).toContain('HAS_SPECIAL')
  })
})

describe('checkPassword — NO_COMMON_PATTERN', () => {
  it('passes for a string with no known patterns', () => {
    const { failedChecks } = checkPassword('xzwvutsr')
    expect(failedChecks).not.toContain('NO_COMMON_PATTERN')
  })

  it('fails when "password" is present', () => {
    const { failedChecks } = checkPassword('password1')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "PASSWORD" is present (case-insensitive)', () => {
    const { failedChecks } = checkPassword('PASSWORD1')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "qwerty" is present', () => {
    const { failedChecks } = checkPassword('qwerty99!')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "123" is present', () => {
    const { failedChecks } = checkPassword('Xzwvuts123!')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })

  it('fails when "letmein" is present', () => {
    const { failedChecks } = checkPassword('letmein99')
    expect(failedChecks).toContain('NO_COMMON_PATTERN')
  })
})

describe('checkPassword — score to level mapping', () => {
  // score 0 → level 0 (Very Weak): empty string fails all checks
  it('maps score 0 to level 0', () => {
    expect(checkPassword('').level).toBe(0)
  })

  // score 1 → level 0 (Very Weak): 7-char string with no other passing checks
  // 'zxwvuts' (7 chars, lowercase, no digit, no special, no common pattern)
  it('maps score 1 to level 0', () => {
    expect(checkPassword('zxwvuts').level).toBe(0)
  })

  // score 2 → level 1 (Weak): 8-char lowercase, no digit, no special, no common pattern
  // 'xzwvutsr' passes MIN_LENGTH_8 + NO_COMMON_PATTERN = 2 points
  it('maps score 2 to level 1', () => {
    expect(checkPassword('xzwvutsr').level).toBe(1)
  })

  // score 3 → level 2 (Fair): 8 chars + uppercase + no common pattern
  // 'Xzwvutsr' passes MIN_LENGTH_8 + HAS_UPPERCASE + NO_COMMON_PATTERN = 3 points
  it('maps score 3 to level 2', () => {
    expect(checkPassword('Xzwvutsr').level).toBe(2)
  })

  // score 4 → level 3 (Strong): 8 chars + uppercase + digit + no common pattern
  // 'Xzwvuts1' passes MIN_LENGTH_8 + HAS_UPPERCASE + HAS_DIGIT + NO_COMMON_PATTERN = 4 points
  it('maps score 4 to level 3', () => {
    expect(checkPassword('Xzwvuts1').level).toBe(3)
  })

  // score 5 → level 4 (Very Strong): 8 chars + uppercase + digit + special + no common pattern
  // 'Xzwvuts1!' passes all except MIN_LENGTH_12 = 5 points
  it('maps score 5 to level 4', () => {
    expect(checkPassword('Xzwvuts1!').level).toBe(4)
  })

  // score 6 → level 4 (Very Strong): all 6 checks pass
  // 'Xzwvutsrqp1!' — 12 chars, uppercase, digit, special, no common pattern
  it('maps score 6 to level 4', () => {
    expect(checkPassword('Xzwvutsrqp1!').level).toBe(4)
  })
})

describe('checkPassword — feedback list', () => {
  it('returns empty failedChecks when all checks pass', () => {
    const { failedChecks } = checkPassword('Xzwvutsrqp1!')
    expect(failedChecks).toHaveLength(0)
  })

  it('reports only the failed checks', () => {
    // 'xzwvutsr': passes MIN_LENGTH_8 + NO_COMMON_PATTERN, fails the rest
    const { failedChecks } = checkPassword('xzwvutsr')
    expect(failedChecks).not.toContain('MIN_LENGTH_8')
    expect(failedChecks).not.toContain('NO_COMMON_PATTERN')
    expect(failedChecks).toContain('MIN_LENGTH_12')
    expect(failedChecks).toContain('HAS_UPPERCASE')
    expect(failedChecks).toContain('HAS_DIGIT')
    expect(failedChecks).toContain('HAS_SPECIAL')
  })
})
