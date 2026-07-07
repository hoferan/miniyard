'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  type GameState,
  createInitialState,
  startGame,
  beginInput,
  submitTap,
  getFlashIntervalMs,
} from './logic'
import { MESSAGES } from './messages'
import { createHighScoreStore } from '@/lib/high-score'

const bestScoreStore = createHighScoreStore('colour-sequence-memory:high-score')

const TILE_LABELS = ['Red', 'Blue', 'Green', 'Yellow']
const TILE_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400']
const TAP_FLASH_MS = 200
const FLASH_ON_RATIO = 0.6
const SEQUENCE_LEAD_IN_MS = 700

export default function ColourSequenceMemory() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [activeTile, setActiveTile] = useState<number | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setBestScore(bestScoreStore.load())
  }, [])

  useEffect(() => {
    if (state.phase !== 'showing') return
    const intervalMs = getFlashIntervalMs(state.sequence.length)
    const timeouts: ReturnType<typeof setTimeout>[] = []
    state.sequence.forEach((tile, i) => {
      timeouts.push(
        setTimeout(() => setActiveTile(tile), SEQUENCE_LEAD_IN_MS + i * intervalMs)
      )
      timeouts.push(
        setTimeout(
          () => setActiveTile(null),
          SEQUENCE_LEAD_IN_MS + i * intervalMs + intervalMs * FLASH_ON_RATIO
        )
      )
    })
    timeouts.push(
      setTimeout(() => {
        setActiveTile(null)
        setState((prev) => beginInput(prev))
      }, SEQUENCE_LEAD_IN_MS + state.sequence.length * intervalMs)
    )
    return () => timeouts.forEach(clearTimeout)
  }, [state.phase, state.sequence])

  useEffect(() => {
    if (state.phase === 'gameover') {
      const prev = bestScoreStore.load()
      const improved = prev === null || state.score > prev
      if (improved) bestScoreStore.save(state.score)
      setBestScore(improved ? state.score : prev)
      setIsNewBest(improved)
    }
  }, [state.phase, state.score])

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    }
  }, [])

  const handleTileTap = useCallback((tileIndex: number) => {
    setState((prev) => (prev.phase === 'input' ? submitTap(prev, tileIndex) : prev))
    setActiveTile(tileIndex)
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    tapTimeoutRef.current = setTimeout(() => setActiveTile(null), TAP_FLASH_MS)
  }, [])

  const handleNewGame = useCallback(() => {
    setState(createInitialState())
    setActiveTile(null)
    setIsNewBest(false)
  }, [])

  return (
    <main className="max-w-md mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">
          {MESSAGES.scoreLabel}{' '}
          <span className="font-bold text-foreground" data-testid="current-score">
            {state.score}
          </span>
        </span>
        {bestScore !== null && (
          <span className="text-muted-foreground">
            {MESSAGES.bestLabel} <span className="font-bold text-foreground">{bestScore}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 aspect-square select-none touch-none rounded-3xl bg-muted p-3">
        {TILE_COLORS.map((color, i) => (
          <button
            key={i}
            type="button"
            aria-label={TILE_LABELS[i]}
            disabled={state.phase !== 'input'}
            onClick={() => handleTileTap(i)}
            className={cn(
              'rounded-2xl shadow-md transition-all duration-100 disabled:cursor-not-allowed',
              color,
              activeTile === i
                ? 'opacity-100 brightness-125 scale-[1.04] ring-4 ring-white/80 shadow-lg'
                : 'opacity-40'
            )}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={handleNewGame} variant="outline">
          {MESSAGES.newGame}
        </Button>
      </div>

      <Dialog open={state.phase === 'idle'} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-sm [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{MESSAGES.startTitle}</DialogTitle>
            <DialogDescription>{MESSAGES.startDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setState((prev) => startGame(prev))} className="w-full">
              {MESSAGES.startButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={state.phase === 'gameover'}
        onOpenChange={(open) => {
          if (!open) handleNewGame()
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <Trophy className="h-12 w-12 text-primary" aria-hidden="true" />
            <DialogTitle>{MESSAGES.gameOverTitle}</DialogTitle>
            <DialogDescription>{MESSAGES.gameOverSummary(state.score)}</DialogDescription>
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
