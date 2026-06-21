import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  startWaiting,
  triggerReady,
  recordResult,
  handleFalseStart,
  resetToIdle,
  MAX_HISTORY,
} from './logic'

describe('createInitialState', () => {
  it('starts in idle phase with all null fields', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.readyAt).toBeNull()
    expect(state.reactionTime).toBeNull()
    expect(state.history).toEqual([])
    expect(state.personalBest).toBeNull()
  })

  it('accepts pre-loaded history and personal best', () => {
    const state = createInitialState([300, 250], 250)
    expect(state.history).toEqual([300, 250])
    expect(state.personalBest).toBe(250)
  })
})

describe('startWaiting', () => {
  it('transitions to waiting phase and clears reactionTime', () => {
    const state = { ...createInitialState(), reactionTime: 300 }
    const next = startWaiting(state)
    expect(next.phase).toBe('waiting')
    expect(next.reactionTime).toBeNull()
  })
})

describe('triggerReady', () => {
  it('transitions to ready phase and stores readyAt timestamp', () => {
    const state = { ...createInitialState(), phase: 'waiting' as const }
    const next = triggerReady(state, 5000)
    expect(next.phase).toBe('ready')
    expect(next.readyAt).toBe(5000)
  })
})

describe('recordResult', () => {
  it('calculates reaction time as (now - readyAt)', () => {
    const state = { ...createInitialState(), phase: 'ready' as const, readyAt: 1000 }
    const next = recordResult(state, 1247)
    expect(next.reactionTime).toBe(247)
    expect(next.phase).toBe('result')
  })

  it('prepends the new time to history', () => {
    const state = { ...createInitialState([300]), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 250)
    expect(next.history[0]).toBe(250)
    expect(next.history[1]).toBe(300)
  })

  it('caps history at MAX_HISTORY entries, dropping the oldest', () => {
    const history = [200, 210, 220, 230, 240]
    const state = { ...createInitialState(history), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 190)
    expect(next.history).toHaveLength(MAX_HISTORY)
    expect(next.history[0]).toBe(190)
    expect(next.history[MAX_HISTORY - 1]).toBe(230)
  })

  it('updates personal best when new time is lower', () => {
    const state = { ...createInitialState([], 300), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 250)
    expect(next.personalBest).toBe(250)
  })

  it('keeps personal best when new time is higher', () => {
    const state = { ...createInitialState([], 200), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 300)
    expect(next.personalBest).toBe(200)
  })

  it('sets personal best on the very first attempt', () => {
    const state = { ...createInitialState(), phase: 'ready' as const, readyAt: 0 }
    const next = recordResult(state, 247)
    expect(next.personalBest).toBe(247)
  })

  it('returns the state unchanged when readyAt is null', () => {
    const state = createInitialState()
    expect(recordResult(state, 1000)).toBe(state)
  })
})

describe('handleFalseStart', () => {
  it('transitions waiting → idle', () => {
    const state = { ...createInitialState(), phase: 'waiting' as const }
    const next = handleFalseStart(state)
    expect(next.phase).toBe('idle')
  })
})

describe('resetToIdle', () => {
  it('transitions result → idle and clears reactionTime', () => {
    const state = { ...createInitialState(), phase: 'result' as const, reactionTime: 247 }
    const next = resetToIdle(state)
    expect(next.phase).toBe('idle')
    expect(next.reactionTime).toBeNull()
  })
})
