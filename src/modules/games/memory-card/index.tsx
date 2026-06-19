'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { MESSAGES } from './messages'

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
    <main className="max-w-lg mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">
          {MESSAGES.movesLabel}{' '}
          <span className="font-bold text-foreground">{state.moves}</span>
        </span>
        <span className="text-muted-foreground">
          {MESSAGES.timeLabel}{' '}
          <span className="font-bold text-foreground">{MESSAGES.elapsed(elapsed)}</span>
        </span>
        {bestScore !== null && (
          <span className="text-muted-foreground">
            {MESSAGES.bestLabel}{' '}
            <span className="font-bold text-foreground">{MESSAGES.bestMoves(bestScore)}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {state.cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.status !== 'hidden' || state.isLocked}
            aria-label={card.status !== 'hidden' ? card.emoji : MESSAGES.hiddenCard}
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
          {MESSAGES.newGame}
        </Button>
      </div>

      <Dialog
        open={state.phase === 'won'}
        onOpenChange={(open) => { if (!open) handleNewGame() }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="text-5xl">🎉</div>
            <DialogTitle>{MESSAGES.youWon}</DialogTitle>
            <DialogDescription>{MESSAGES.summary(state.moves, elapsed)}</DialogDescription>
          </DialogHeader>
          {isNewBest && (
            <p className="text-center text-sm font-semibold text-green-500">{MESSAGES.newBest}</p>
          )}
          <DialogFooter>
            <Button onClick={handleNewGame} className="w-full">
              {MESSAGES.playAgain}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
