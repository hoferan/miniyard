import { describe, it, expect } from 'vitest'
import {
  TILE_COUNT,
  createInitialState,
  startGame,
  beginInput,
  submitTap,
  getFlashIntervalMs,
} from './logic'

describe('createInitialState', () => {
  it('starts idle with an empty sequence and zero score', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.sequence).toEqual([])
    expect(state.inputIndex).toBe(0)
    expect(state.score).toBe(0)
  })
})

describe('startGame', () => {
  it('appends one tile within range and transitions to showing', () => {
    const state = startGame(createInitialState(), () => 0.5)
    expect(state.phase).toBe('showing')
    expect(state.sequence).toHaveLength(1)
    expect(state.sequence[0]).toBeGreaterThanOrEqual(0)
    expect(state.sequence[0]).toBeLessThan(TILE_COUNT)
  })

  it('does nothing if not idle', () => {
    const state = startGame(createInitialState(), () => 0.5)
    expect(startGame(state, () => 0.1)).toEqual(state)
  })
})

describe('beginInput', () => {
  it('transitions showing to input', () => {
    const state = startGame(createInitialState(), () => 0)
    expect(beginInput(state).phase).toBe('input')
  })

  it('is ignored when not showing', () => {
    const state = createInitialState()
    expect(beginInput(state)).toEqual(state)
  })
})

describe('submitTap', () => {
  it('advances inputIndex on a correct tap mid-sequence', () => {
    const showing = startGame(createInitialState(), () => 0) // sequence: [0]
    const withSecondTile = { ...showing, sequence: [0, 1] }
    const input = beginInput(withSecondTile)
    const next = submitTap(input, 0)
    expect(next.phase).toBe('input')
    expect(next.inputIndex).toBe(1)
    expect(next.sequence).toEqual([0, 1])
    expect(next.score).toBe(0)
  })

  it('completes the round on the last correct tap: appends a tile, resets inputIndex, increments score', () => {
    const state = beginInput(startGame(createInitialState(), () => 0)) // sequence: [0], phase input
    const next = submitTap(state, 0, () => 0.99)
    expect(next.phase).toBe('showing')
    expect(next.inputIndex).toBe(0)
    expect(next.score).toBe(1)
    expect(next.sequence).toEqual([0, 3])
  })

  it('ends the game on a wrong tap', () => {
    const state = beginInput(startGame(createInitialState(), () => 0)) // sequence: [0]
    const next = submitTap(state, 1)
    expect(next.phase).toBe('gameover')
    expect(next.sequence).toEqual([0])
    expect(next.score).toBe(0)
  })

  it('is ignored when phase is not input', () => {
    const state = createInitialState()
    expect(submitTap(state, 0)).toEqual(state)
  })
})

describe('getFlashIntervalMs', () => {
  it('returns 800 at round 1', () => {
    expect(getFlashIntervalMs(1)).toBe(800)
  })

  it('decreases by 20ms per round', () => {
    expect(getFlashIntervalMs(6)).toBe(700)
  })

  it('floors at 300', () => {
    expect(getFlashIntervalMs(1000)).toBe(300)
  })
})
