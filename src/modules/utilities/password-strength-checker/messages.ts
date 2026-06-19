import type { CheckKey, StrengthLevel } from './logic'

export const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  0: 'Very Weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Strong',
  4: 'Very Strong',
}

export const FEEDBACK: Record<CheckKey, string> = {
  MIN_LENGTH_8: 'Use at least 8 characters',
  MIN_LENGTH_12: 'Use at least 12 characters',
  HAS_UPPERCASE: 'Add an uppercase letter',
  HAS_DIGIT: 'Add a number',
  HAS_SPECIAL: 'Add a special character (e.g. ! @ # $)',
  NO_COMMON_PATTERN: 'Avoid common patterns (e.g. "password", "qwerty", "123")',
}

export const UI = {
  inputLabel: 'Password',
  placeholder: 'Type a password to check its strength…',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  feedbackHeading: 'How to improve:',
  progressbarLabel: 'Password strength',
  scoreFormat: (score: number) => `${score} / 6`,
  failedCheckIcon: '✕',
}
