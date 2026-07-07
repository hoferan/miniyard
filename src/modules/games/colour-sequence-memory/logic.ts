export const TILE_COUNT = 4

export type Phase = 'idle' | 'showing' | 'input' | 'gameover'

export interface GameState {
  sequence: number[]
  inputIndex: number
  score: number
  phase: Phase
}

function pickRandomTile(random: () => number): number {
  return Math.floor(random() * TILE_COUNT)
}

export function createInitialState(): GameState {
  return {
    sequence: [],
    inputIndex: 0,
    score: 0,
    phase: 'idle',
  }
}

export function startGame(state: GameState, random: () => number = Math.random): GameState {
  if (state.phase !== 'idle') return state
  return {
    ...state,
    sequence: [pickRandomTile(random)],
    phase: 'showing',
  }
}

export function beginInput(state: GameState): GameState {
  if (state.phase !== 'showing') return state
  return { ...state, phase: 'input' }
}

export function submitTap(
  state: GameState,
  tileIndex: number,
  random: () => number = Math.random
): GameState {
  if (state.phase !== 'input') return state

  if (tileIndex !== state.sequence[state.inputIndex]) {
    return { ...state, phase: 'gameover' }
  }

  const nextInputIndex = state.inputIndex + 1
  if (nextInputIndex < state.sequence.length) {
    return { ...state, inputIndex: nextInputIndex }
  }

  return {
    ...state,
    sequence: [...state.sequence, pickRandomTile(random)],
    inputIndex: 0,
    score: state.score + 1,
    phase: 'showing',
  }
}

export function getFlashIntervalMs(round: number): number {
  const interval = 800 - (round - 1) * 20
  return Math.max(interval, 300)
}
