'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  EMOJIS,
  GameState,
  createInitialState,
  flipCard,
  resolveMismatch,
  getElapsedSeconds,
  shuffleEmojis,
} from './logic'

const BEST_SCORE_KEY = 'memory-card:best-score'

function loadBestScore(): number | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(BEST_SCORE_KEY)
  return stored !== null ? parseInt(stored, 10) : null
}

function saveBestScore(moves: number): number | null {
  const prev = loadBestScore()
  if (prev === null || moves < prev) {
    localStorage.setItem(BEST_SCORE_KEY, String(moves))
    return moves
  }
  return prev
}

export default function MemoryCard() {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(shuffleEmojis(EMOJIS))
  )
  const [now, setNow] = useState(() => Date.now())
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setBestScore(loadBestScore())
  }, [])

  useEffect(() => {
    if (state.phase === 'playing') {
      timerRef.current = setInterval(() => setNow(Date.now()), 500)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'won') {
      const newBest = saveBestScore(state.moves)
      const improved = newBest === state.moves
      setBestScore(newBest)
      setIsNewBest(improved)
    }
  }, [state.phase, state.moves])

  const handleCardClick = useCallback((cardId: number) => {
    setState((prev) => {
      const next = flipCard(prev, cardId, Date.now())
      if (next.isLocked && !prev.isLocked) {
        setTimeout(() => setState(resolveMismatch), 750)
      }
      return next
    })
  }, [])

  const handleNewGame = useCallback(() => {
    setState(createInitialState(shuffleEmojis(EMOJIS)))
    setNow(Date.now())
    setIsNewBest(false)
  }, [])

  const elapsed = getElapsedSeconds(state, now)

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Memory Card Matching</h1>

      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">
          Moves:{' '}
          <span className="font-bold text-foreground">{state.moves}</span>
        </span>
        <span className="text-muted-foreground">
          Time:{' '}
          <span className="font-bold text-foreground">{elapsed}s</span>
        </span>
        {bestScore !== null && (
          <span className="text-muted-foreground">
            Best:{' '}
            <span className="font-bold text-foreground">{bestScore} moves</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {state.cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.status !== 'hidden' || state.isLocked}
            aria-label={card.status !== 'hidden' ? card.emoji : 'Hidden card'}
            className={cn(
              'aspect-square rounded-xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-200 select-none font-emoji',
              card.status === 'hidden' &&
                'bg-primary hover:bg-primary/90 active:scale-95 cursor-pointer',
              card.status === 'flipped' && 'bg-secondary cursor-default',
              card.status === 'matched' &&
                'bg-green-500/20 dark:bg-green-500/30 cursor-default'
            )}
          >
            {card.status !== 'hidden' ? card.emoji : null}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={handleNewGame} variant="outline">
          New Game
        </Button>
      </div>

      {state.phase === 'won' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">You won!</h2>
            <p className="text-muted-foreground mb-2">
              {state.moves} moves in {elapsed}s
            </p>
            {isNewBest && (
              <p className="text-green-500 font-semibold mb-4">New best score!</p>
            )}
            <Button onClick={handleNewGame} className="w-full mt-4">
              Play again
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
