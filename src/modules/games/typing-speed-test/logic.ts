export type CharState = 'pending' | 'correct' | 'incorrect'
export type GamePhase = 'idle' | 'playing' | 'finished'

export interface GameState {
  passage: string
  charStates: CharState[]
  currentIndex: number
  phase: GamePhase
  startedAt: number | null
  endedAt: number | null
  errorCount: number
  totalAttempts: number
}

export interface Results {
  wpm: number
  accuracy: number
  charsTyped: number
  errorCount: number
}

export const WORD_LIST: string[] = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need',
  'large', 'often', 'hand', 'high', 'place', 'hold', 'turn', 'were', 'show',
  'around', 'form', 'every', 'small', 'set', 'put', 'end', 'does', 'another',
  'well', 'large', 'need', 'big', 'long', 'down', 'never', 'old', 'same',
  'tell', 'boy', 'follow', 'came', 'want', 'show', 'also', 'around', 'form',
  'three', 'small', 'set', 'put', 'end', 'home', 'read', 'found', 'still',
  'learn', 'plant', 'cover', 'food', 'sun', 'four', 'thought', 'let', 'keep',
  'children', 'feet', 'land', 'side', 'without', 'once', 'took', 'example',
  'always', 'those', 'both', 'paper', 'together', 'got', 'group', 'often',
  'run', 'important', 'until', 'song', 'being', 'leave', 'family', 'body',
  'music', 'color', 'stand', 'sun', 'questions', 'fish', 'area', 'mark',
  'dog', 'horse', 'birds', 'problem', 'done', 'know', 'since', 'ever',
  'piece', 'told', 'usually', 'heart', 'once', 'below', 'voice', 'town',
  'miss', 'father', 'young', 'talk', 'soon', 'list', 'song', 'leave',
  'answer', 'school', 'drive', 'start', 'night', 'walk', 'open', 'seem',
]

export function generatePassage(
  wordList: string[],
  count: number,
  random: () => number = Math.random
): string {
  const shuffled = [...wordList]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count).join(' ')
}

export function createInitialState(passage: string): GameState {
  return {
    passage,
    charStates: Array(passage.length).fill('pending') as CharState[],
    currentIndex: 0,
    phase: 'idle',
    startedAt: null,
    endedAt: null,
    errorCount: 0,
    totalAttempts: 0,
  }
}

const IGNORED_KEYS = new Set([
  'Tab', 'Enter', 'Shift', 'Control', 'Alt', 'Meta',
  'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete', 'F1', 'F2',
  'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
])

export function handleKeypress(state: GameState, key: string, now: number): GameState {
  if (state.phase === 'finished') return state

  if (key === 'Backspace') {
    if (state.phase === 'idle') return state
    const charStates = [...state.charStates]
    if (charStates[state.currentIndex] === 'incorrect') {
      charStates[state.currentIndex] = 'pending'
      return { ...state, charStates }
    }
    if (state.currentIndex > 0) {
      const newIndex = state.currentIndex - 1
      charStates[newIndex] = 'pending'
      return { ...state, charStates, currentIndex: newIndex }
    }
    return state
  }

  if (IGNORED_KEYS.has(key) || key.length !== 1) return state

  const startedAt = state.startedAt ?? now
  const phase: GamePhase = state.phase === 'idle' ? 'playing' : state.phase
  const charStates = [...state.charStates]
  const totalAttempts = state.totalAttempts + 1

  if (state.passage[state.currentIndex] === key) {
    charStates[state.currentIndex] = 'correct'
    const currentIndex = state.currentIndex + 1
    const finished = currentIndex === state.passage.length
    return {
      ...state,
      charStates,
      currentIndex,
      phase: finished ? 'finished' : phase,
      startedAt,
      endedAt: finished ? now : state.endedAt,
      totalAttempts,
    }
  }

  charStates[state.currentIndex] = 'incorrect'
  return {
    ...state,
    charStates,
    phase,
    startedAt,
    totalAttempts,
    errorCount: state.errorCount + 1,
  }
}

export function tick(state: GameState, now: number): GameState {
  if (state.phase !== 'playing' || state.startedAt === null) return state
  if (now - state.startedAt >= 60000) {
    return { ...state, phase: 'finished', endedAt: now }
  }
  return state
}

export function calculateWPM(correctChars: number, elapsedMs: number): number {
  if (elapsedMs === 0 || correctChars === 0) return 0
  return (correctChars / 5) / (elapsedMs / 60000)
}

export function calculateAccuracy(totalAttempts: number, correctChars: number): number {
  if (totalAttempts === 0) return 100
  return (correctChars / totalAttempts) * 100
}

export function getResults(state: GameState, now: number): Results {
  const elapsedMs = state.startedAt !== null ? (state.endedAt ?? now) - state.startedAt : 0
  const correctChars = state.charStates.filter((s) => s === 'correct').length
  return {
    wpm: calculateWPM(correctChars, elapsedMs),
    accuracy: calculateAccuracy(state.totalAttempts, correctChars),
    charsTyped: state.currentIndex,
    errorCount: state.errorCount,
  }
}
