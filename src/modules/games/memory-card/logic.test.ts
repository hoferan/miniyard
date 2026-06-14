import { describe, it, expect } from 'vitest'
import {
  EMOJIS,
  createInitialState,
  flipCard,
  resolveMismatch,
  getElapsedSeconds,
  shuffleEmojis,
} from './logic'

// Controlled deck: pairs at adjacent positions (0-1, 2-3, ..., 14-15)
const PAIR_DECK = EMOJIS.flatMap((e) => [e, e])

describe('EMOJIS', () => {
  it('has exactly 8 emojis', () => {
    expect(EMOJIS).toHaveLength(8)
  })

  it('has no duplicates', () => {
    expect(new Set(EMOJIS).size).toBe(8)
  })
})

describe('shuffleEmojis', () => {
  it('returns 16 cards (8 pairs)', () => {
    expect(shuffleEmojis(EMOJIS)).toHaveLength(16)
  })

  it('contains each emoji exactly twice', () => {
    const result = shuffleEmojis(EMOJIS)
    for (const emoji of EMOJIS) {
      expect(result.filter((e) => e === emoji)).toHaveLength(2)
    }
  })

  it('produces a deterministic result with an injected random function', () => {
    const seeded = () => 0
    expect(shuffleEmojis(EMOJIS, seeded)).toEqual(shuffleEmojis(EMOJIS, seeded))
  })
})

describe('createInitialState', () => {
  it('creates 16 hidden cards', () => {
    const state = createInitialState(PAIR_DECK)
    expect(state.cards).toHaveLength(16)
    expect(state.cards.every((c) => c.status === 'hidden')).toBe(true)
  })

  it('assigns ids 0-15', () => {
    const state = createInitialState(PAIR_DECK)
    expect(state.cards.map((c) => c.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('starts in idle phase with zero moves and no selection', () => {
    const state = createInitialState(PAIR_DECK)
    expect(state.phase).toBe('idle')
    expect(state.moves).toBe(0)
    expect(state.matchedPairs).toBe(0)
    expect(state.isLocked).toBe(false)
    expect(state.firstFlippedId).toBeNull()
    expect(state.startedAt).toBeNull()
    expect(state.endedAt).toBeNull()
  })
})

describe('flipCard', () => {
  it('flips the first card and starts the timer', () => {
    const state = createInitialState(PAIR_DECK)
    const next = flipCard(state, 0, 1000)
    expect(next.cards[0].status).toBe('flipped')
    expect(next.firstFlippedId).toBe(0)
    expect(next.startedAt).toBe(1000)
    expect(next.phase).toBe('playing')
    expect(next.moves).toBe(0)
  })

  it('ignores a click on the currently flipped first card', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 0, 1100)
    expect(after2).toEqual(after1)
  })

  it('ignores a click on a matched card', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 1, 2000)
    const after3 = flipCard(after2, 0, 3000)
    expect(after3).toEqual(after2)
  })

  it('ignores all clicks when the board is locked', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 2, 2000)
    expect(after2.isLocked).toBe(true)
    const after3 = flipCard(after2, 4, 3000)
    expect(after3).toEqual(after2)
  })

  it('increments moves only on the second flip of each pair-attempt', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    expect(after1.moves).toBe(0)
    const after2 = flipCard(after1, 1, 2000)
    expect(after2.moves).toBe(1)
  })

  it('records a match when two cards share the same emoji', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 1, 2000)
    expect(after2.cards[0].status).toBe('matched')
    expect(after2.cards[1].status).toBe('matched')
    expect(after2.matchedPairs).toBe(1)
    expect(after2.firstFlippedId).toBeNull()
    expect(after2.isLocked).toBe(false)
  })

  it('locks the board on a mismatch', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 2, 2000)
    expect(after2.cards[0].status).toBe('flipped')
    expect(after2.cards[2].status).toBe('flipped')
    expect(after2.isLocked).toBe(true)
    expect(after2.firstFlippedId).toBeNull()
  })

  it('sets phase to "won" when the last pair is matched', () => {
    let state = createInitialState(PAIR_DECK)
    let now = 1000
    for (let i = 0; i < 16; i += 2) {
      state = flipCard(state, i, now++)
      state = flipCard(state, i + 1, now++)
    }
    expect(state.phase).toBe('won')
    expect(state.matchedPairs).toBe(8)
    expect(state.endedAt).not.toBeNull()
  })

  it('does not restart the timer on subsequent pair-attempts', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 2, 2000)
    const resolved = resolveMismatch(after2)
    const after3 = flipCard(resolved, 4, 3000)
    expect(after3.startedAt).toBe(1000)
  })
})

describe('resolveMismatch', () => {
  it('flips mismatched cards back to hidden and unlocks the board', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 2, 2000)
    const resolved = resolveMismatch(after2)
    expect(resolved.cards[0].status).toBe('hidden')
    expect(resolved.cards[2].status).toBe('hidden')
    expect(resolved.isLocked).toBe(false)
  })

  it('does not affect previously matched cards', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 1000)
    const after2 = flipCard(after1, 1, 2000)
    const after3 = flipCard(after2, 2, 3000)
    const after4 = flipCard(after3, 4, 4000)
    const resolved = resolveMismatch(after4)
    expect(resolved.cards[0].status).toBe('matched')
    expect(resolved.cards[1].status).toBe('matched')
    expect(resolved.cards[2].status).toBe('hidden')
    expect(resolved.cards[4].status).toBe('hidden')
  })
})

describe('getElapsedSeconds', () => {
  it('returns 0 when the game has not started', () => {
    const state = createInitialState(PAIR_DECK)
    expect(getElapsedSeconds(state, 5000)).toBe(0)
  })

  it('returns elapsed seconds while playing', () => {
    const state = createInitialState(PAIR_DECK)
    const after1 = flipCard(state, 0, 0)
    expect(getElapsedSeconds(after1, 5000)).toBe(5)
  })

  it('returns the frozen elapsed seconds after the game is won', () => {
    let state = createInitialState(PAIR_DECK)
    let now = 0
    for (let i = 0; i < 16; i += 2) {
      state = flipCard(state, i, now)
      now += 1000
      state = flipCard(state, i + 1, now)
      now += 1000
    }
    const elapsed = getElapsedSeconds(state, 9_999_999)
    expect(elapsed).toBe(Math.floor((state.endedAt! - state.startedAt!) / 1000))
  })
})
