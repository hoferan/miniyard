export const EMOJIS = ['🐶', '🐱', '🐻', '🦊', '🐸', '🦁', '🐯', '🐼']

export type CardStatus = 'hidden' | 'flipped' | 'matched'

export interface Card {
  id: number
  emoji: string
  status: CardStatus
}

export type GamePhase = 'idle' | 'playing' | 'won'

export interface GameState {
  cards: Card[]
  firstFlippedId: number | null
  moves: number
  matchedPairs: number
  isLocked: boolean
  startedAt: number | null
  endedAt: number | null
  phase: GamePhase
}

const TOTAL_PAIRS = EMOJIS.length

export function shuffleEmojis(emojis: string[], random: () => number = Math.random): string[] {
  const deck = [...emojis, ...emojis]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function createInitialState(shuffledEmojis: string[]): GameState {
  return {
    cards: shuffledEmojis.map((emoji, id) => ({ id, emoji, status: 'hidden' })),
    firstFlippedId: null,
    moves: 0,
    matchedPairs: 0,
    isLocked: false,
    startedAt: null,
    endedAt: null,
    phase: 'idle',
  }
}

export function flipCard(state: GameState, cardId: number, now: number): GameState {
  if (state.isLocked) return state

  const card = state.cards[cardId]
  if (!card || card.status !== 'hidden') return state
  if (state.firstFlippedId === cardId) return state

  const newCards = state.cards.map((c) =>
    c.id === cardId ? { ...c, status: 'flipped' as CardStatus } : c
  )
  const startedAt = state.startedAt ?? now

  if (state.firstFlippedId === null) {
    return { ...state, cards: newCards, firstFlippedId: cardId, startedAt, phase: 'playing' }
  }

  const firstCard = state.cards[state.firstFlippedId]
  const moves = state.moves + 1

  if (firstCard.emoji === card.emoji) {
    const matchedCards = newCards.map((c) =>
      c.id === cardId || c.id === state.firstFlippedId!
        ? { ...c, status: 'matched' as CardStatus }
        : c
    )
    const matchedPairs = state.matchedPairs + 1
    const won = matchedPairs === TOTAL_PAIRS
    return {
      ...state,
      cards: matchedCards,
      firstFlippedId: null,
      moves,
      matchedPairs,
      startedAt,
      endedAt: won ? now : state.endedAt,
      phase: won ? 'won' : 'playing',
    }
  }

  return { ...state, cards: newCards, firstFlippedId: null, moves, isLocked: true, startedAt }
}

export function resolveMismatch(state: GameState): GameState {
  return {
    ...state,
    cards: state.cards.map((c) => (c.status === 'flipped' ? { ...c, status: 'hidden' } : c)),
    isLocked: false,
  }
}

export function getElapsedSeconds(state: GameState, now: number): number {
  if (state.startedAt === null) return 0
  const end = state.endedAt ?? now
  return Math.floor((end - state.startedAt) / 1000)
}
