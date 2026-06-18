import { describe, it, expect } from 'vitest'
import {
  generatePassage,
  createInitialState,
  handleKeypress,
  tick,
  calculateWPM,
  calculateAccuracy,
  getResults,
  WORD_LIST,
} from './logic'

// ─── generatePassage ───────────────────────────────────────────────────────

describe('generatePassage', () => {
  const seqRandom = () => 0

  it('joins requested number of words with spaces', () => {
    const words = ['apple', 'banana', 'cherry', 'date', 'elderberry']
    const passage = generatePassage(words, 3, seqRandom)
    expect(passage.split(' ')).toHaveLength(3)
  })

  it('produces a non-empty string', () => {
    const passage = generatePassage(WORD_LIST, 80, Math.random)
    expect(passage.length).toBeGreaterThan(0)
  })

  it('uses the injected random function (deterministic with fixed seed)', () => {
    let call = 0
    const fixedRandom = () => [0.1, 0.9, 0.5, 0.3, 0.7][call++ % 5]
    const a = generatePassage(WORD_LIST, 10, fixedRandom)
    call = 0
    const b = generatePassage(WORD_LIST, 10, fixedRandom)
    expect(a).toBe(b)
  })

  it('two calls with different randoms produce (very likely) different passages', () => {
    const a = generatePassage(WORD_LIST, 20, Math.random)
    const b = generatePassage(WORD_LIST, 20, Math.random)
    // With 200 words and 20 picks the chance of identical result is negligible
    expect(a === b).toBe(false)
  })
})

// ─── createInitialState ────────────────────────────────────────────────────

describe('createInitialState', () => {
  it('returns phase idle', () => {
    const state = createInitialState('hello world')
    expect(state.phase).toBe('idle')
  })

  it('creates charStates with length equal to passage length', () => {
    const passage = 'hi there'
    const state = createInitialState(passage)
    expect(state.charStates).toHaveLength(passage.length)
  })

  it('all charStates start as pending', () => {
    const state = createInitialState('abc')
    expect(state.charStates.every((s) => s === 'pending')).toBe(true)
  })

  it('currentIndex starts at 0', () => {
    expect(createInitialState('test').currentIndex).toBe(0)
  })

  it('counters start at 0', () => {
    const state = createInitialState('test')
    expect(state.errorCount).toBe(0)
    expect(state.totalAttempts).toBe(0)
  })

  it('timestamps start null', () => {
    const state = createInitialState('test')
    expect(state.startedAt).toBeNull()
    expect(state.endedAt).toBeNull()
  })
})

// ─── handleKeypress ────────────────────────────────────────────────────────

describe('handleKeypress – first keypress starts the timer', () => {
  it('transitions from idle to playing on first printable char', () => {
    const state = createInitialState('hello')
    const next = handleKeypress(state, 'h', 1000)
    expect(next.phase).toBe('playing')
    expect(next.startedAt).toBe(1000)
  })

  it('does not start timer on backspace from idle', () => {
    const state = createInitialState('hello')
    const next = handleKeypress(state, 'Backspace', 1000)
    expect(next.phase).toBe('idle')
    expect(next.startedAt).toBeNull()
  })
})

describe('handleKeypress – correct character', () => {
  it('marks character as correct and advances cursor', () => {
    const state = createInitialState('ab')
    const next = handleKeypress(state, 'a', 100)
    expect(next.charStates[0]).toBe('correct')
    expect(next.currentIndex).toBe(1)
  })

  it('increments totalAttempts', () => {
    const state = createInitialState('a')
    const next = handleKeypress(state, 'a', 100)
    expect(next.totalAttempts).toBe(1)
  })

  it('does not increment errorCount', () => {
    const state = createInitialState('a')
    const next = handleKeypress(state, 'a', 100)
    expect(next.errorCount).toBe(0)
  })
})

describe('handleKeypress – incorrect character', () => {
  it('marks character as incorrect and keeps cursor in place', () => {
    const state = createInitialState('ab')
    const next = handleKeypress(state, 'x', 100)
    expect(next.charStates[0]).toBe('incorrect')
    expect(next.currentIndex).toBe(0)
  })

  it('increments totalAttempts and errorCount', () => {
    const state = createInitialState('a')
    const next = handleKeypress(state, 'z', 100)
    expect(next.totalAttempts).toBe(1)
    expect(next.errorCount).toBe(1)
  })
})

describe('handleKeypress – backspace', () => {
  it('resets incorrect char at current index to pending', () => {
    const state = createInitialState('ab')
    const after = handleKeypress(state, 'x', 100) // types wrong char
    expect(after.charStates[0]).toBe('incorrect')
    const cleared = handleKeypress(after, 'Backspace', 200)
    expect(cleared.charStates[0]).toBe('pending')
    expect(cleared.currentIndex).toBe(0)
  })

  it('retreats cursor and resets previous correct char when current slot is pending', () => {
    const state = createInitialState('ab')
    const after = handleKeypress(state, 'a', 100)  // correct → cursor at 1
    const back = handleKeypress(after, 'Backspace', 200)
    expect(back.currentIndex).toBe(0)
    expect(back.charStates[0]).toBe('pending')
  })

  it('is a no-op when at position 0 with no pending error', () => {
    const state = createInitialState('abc')
    const next = handleKeypress(state, 'Backspace', 100)
    expect(next.currentIndex).toBe(0)
    expect(next.charStates[0]).toBe('pending')
    expect(next.phase).toBe('idle')
  })

  it('does not count backspace in totalAttempts', () => {
    const state = createInitialState('a')
    const wrong = handleKeypress(state, 'z', 100)
    const back = handleKeypress(wrong, 'Backspace', 200)
    expect(back.totalAttempts).toBe(1)
  })
})

describe('handleKeypress – passage completion', () => {
  it('sets phase to finished when last character is typed correctly', () => {
    let state = createInitialState('hi')
    state = handleKeypress(state, 'h', 100)
    state = handleKeypress(state, 'i', 200)
    expect(state.phase).toBe('finished')
    expect(state.endedAt).toBe(200)
  })

  it('ignores keypresses when phase is finished', () => {
    let state = createInitialState('a')
    state = handleKeypress(state, 'a', 100)   // completes the passage
    const frozen = handleKeypress(state, 'x', 200)
    expect(frozen).toEqual(state)
  })
})

describe('handleKeypress – ignored keys', () => {
  it('ignores Tab', () => {
    const state = createInitialState('abc')
    const next = handleKeypress(state, 'Tab', 100)
    expect(next.totalAttempts).toBe(0)
    expect(next.currentIndex).toBe(0)
  })

  it('ignores Enter', () => {
    const state = createInitialState('abc')
    const next = handleKeypress(state, 'Enter', 100)
    expect(next.totalAttempts).toBe(0)
  })

  it('ignores Shift', () => {
    const state = createInitialState('abc')
    const next = handleKeypress(state, 'Shift', 100)
    expect(next.totalAttempts).toBe(0)
  })

  it('ignores Control', () => {
    const state = createInitialState('abc')
    const next = handleKeypress(state, 'Control', 100)
    expect(next.totalAttempts).toBe(0)
  })
})

// ─── tick ──────────────────────────────────────────────────────────────────

describe('tick', () => {
  it('does nothing when phase is idle', () => {
    const state = createInitialState('hello')
    const next = tick(state, 99999)
    expect(next.phase).toBe('idle')
  })

  it('does nothing when phase is finished', () => {
    let state = createInitialState('a')
    state = handleKeypress(state, 'a', 0)   // finishes immediately
    const next = tick(state, 99999)
    expect(next.phase).toBe('finished')
    expect(next.endedAt).toBe(0)  // endedAt not overwritten
  })

  it('does not expire before 60 s', () => {
    let state = createInitialState('hello world')
    state = handleKeypress(state, 'h', 0)   // starts timer at t=0
    const next = tick(state, 59999)
    expect(next.phase).toBe('playing')
  })

  it('expires exactly at 60 s', () => {
    let state = createInitialState('hello world')
    state = handleKeypress(state, 'h', 0)
    const next = tick(state, 60000)
    expect(next.phase).toBe('finished')
    expect(next.endedAt).toBe(60000)
  })

  it('expires after 60 s', () => {
    let state = createInitialState('hello world')
    state = handleKeypress(state, 'h', 0)
    const next = tick(state, 61000)
    expect(next.phase).toBe('finished')
  })
})

// ─── calculateWPM ──────────────────────────────────────────────────────────

describe('calculateWPM', () => {
  it('returns 0 when no time has elapsed', () => {
    expect(calculateWPM(10, 0)).toBe(0)
  })

  it('returns 0 when no correct chars', () => {
    expect(calculateWPM(0, 60000)).toBe(0)
  })

  it('calculates WPM correctly at 60 s', () => {
    // 300 chars / 5 = 60 words in 1 minute = 60 WPM
    expect(calculateWPM(300, 60000)).toBeCloseTo(60, 1)
  })

  it('calculates WPM correctly at 30 s', () => {
    // 150 chars / 5 = 30 words in 0.5 min = 60 WPM
    expect(calculateWPM(150, 30000)).toBeCloseTo(60, 1)
  })

  it('scales linearly with correct chars', () => {
    const wpm1 = calculateWPM(100, 60000)
    const wpm2 = calculateWPM(200, 60000)
    expect(wpm2).toBeCloseTo(wpm1 * 2, 1)
  })
})

// ─── calculateAccuracy ─────────────────────────────────────────────────────

describe('calculateAccuracy', () => {
  it('returns 100 when no keys have been pressed', () => {
    expect(calculateAccuracy(0, 0)).toBe(100)
  })

  it('returns 100 when all attempts are correct', () => {
    expect(calculateAccuracy(50, 50)).toBe(100)
  })

  it('returns 0 when all attempts are wrong', () => {
    expect(calculateAccuracy(20, 0)).toBe(0)
  })

  it('returns 50 when half are correct', () => {
    expect(calculateAccuracy(10, 5)).toBeCloseTo(50, 1)
  })

  it('rounds to expected value', () => {
    // 9 correct out of 10 = 90 %
    expect(calculateAccuracy(10, 9)).toBeCloseTo(90, 1)
  })
})

// ─── getResults ────────────────────────────────────────────────────────────

describe('getResults', () => {
  it('returns charsTyped equal to currentIndex', () => {
    let state = createInitialState('abc')
    state = handleKeypress(state, 'a', 0)
    state = handleKeypress(state, 'b', 100)
    const results = getResults(state, 200)
    expect(results.charsTyped).toBe(2)
  })

  it('returns errorCount from state', () => {
    let state = createInitialState('abc')
    state = handleKeypress(state, 'x', 0)   // wrong
    state = handleKeypress(state, 'Backspace', 50)
    state = handleKeypress(state, 'a', 100) // correct
    const results = getResults(state, 200)
    expect(results.errorCount).toBe(1)
  })

  it('returns wpm 0 when no time has elapsed', () => {
    const state = createInitialState('a')
    const results = getResults(state, 0)
    expect(results.wpm).toBe(0)
  })

  it('returns accuracy 100 when no attempts made', () => {
    const state = createInitialState('hello')
    const results = getResults(state, 5000)
    expect(results.accuracy).toBe(100)
  })

  it('computes wpm based on correct chars typed', () => {
    // 'abc' typed in 2 s → endedAt=2000, elapsed=2 s → WPM=(3/5)/(2/60)=18
    let state = createInitialState('abc')
    state = handleKeypress(state, 'a', 0)
    state = handleKeypress(state, 'b', 1000)
    state = handleKeypress(state, 'c', 2000)
    const results = getResults(state, 60000)
    expect(results.wpm).toBeCloseTo(18, 0)
  })
})
