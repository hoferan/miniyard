export type GamePhase = 'idle' | 'waiting' | 'ready' | 'result'

export interface GameState {
  phase: GamePhase
  readyAt: number | null
  reactionTime: number | null
  history: number[]
  personalBest: number | null
}

export const MAX_HISTORY = 5

export function createInitialState(
  history: number[] = [],
  personalBest: number | null = null
): GameState {
  return {
    phase: 'idle',
    readyAt: null,
    reactionTime: null,
    history,
    personalBest,
  }
}

export function startWaiting(state: GameState): GameState {
  return { ...state, phase: 'waiting', reactionTime: null }
}

export function triggerReady(state: GameState, readyAt: number): GameState {
  return { ...state, phase: 'ready', readyAt }
}

export function recordResult(state: GameState, now: number): GameState {
  if (state.readyAt === null) return state
  const reactionTime = now - state.readyAt
  const history = [reactionTime, ...state.history].slice(0, MAX_HISTORY)
  const personalBest =
    state.personalBest === null || reactionTime < state.personalBest
      ? reactionTime
      : state.personalBest
  return { ...state, phase: 'result', reactionTime, history, personalBest }
}

export function handleFalseStart(state: GameState): GameState {
  return { ...state, phase: 'idle' }
}

export function resetToIdle(state: GameState): GameState {
  return { ...state, phase: 'idle', reactionTime: null }
}
