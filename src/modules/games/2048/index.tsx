'use client'

import { useState, useEffect, useCallback, useRef, type TouchEvent } from 'react'
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
import { createHighScoreStore } from '@/lib/high-score'
import { type Direction, type GameState, keepGoing, move, newGame } from './logic'
import { MESSAGES } from './messages'

const bestScoreStore = createHighScoreStore('2048:high-score')

const SWIPE_THRESHOLD_PX = 20

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

const TILE_STYLES: Record<number, string> = {
  2: 'bg-amber-50 text-stone-700',
  4: 'bg-amber-100 text-stone-700',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-300 text-stone-800',
  256: 'bg-yellow-400 text-stone-800',
  512: 'bg-yellow-500 text-white',
  1024: 'bg-amber-500 text-white',
  2048: 'bg-amber-600 text-white',
}

/** Shared style for tiles above 2048. */
const SUPER_TILE_STYLE = 'bg-stone-800 text-white'

function tileTextSize(value: number): string {
  if (value >= 10000) return 'text-lg sm:text-xl'
  if (value >= 1000) return 'text-xl sm:text-2xl'
  if (value >= 100) return 'text-2xl sm:text-3xl'
  return 'text-3xl sm:text-4xl'
}

export default function Game2048() {
  const [state, setState] = useState<GameState>(() => newGame(Math.random))
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [bestAtStart, setBestAtStart] = useState<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const stored = bestScoreStore.load()
    setBestScore(stored)
    setBestAtStart(stored)
  }, [])

  // Save whenever the score passes the stored best — a keep-going game can be left at any time.
  useEffect(() => {
    if (state.score === 0) return
    const stored = bestScoreStore.load()
    if (stored === null || state.score > stored) {
      bestScoreStore.save(state.score)
      setBestScore(state.score)
    }
  }, [state.score])

  const handleDirection = useCallback((direction: Direction) => {
    setState((prev) => move(prev, direction, Math.random))
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const direction = KEY_DIRECTIONS[e.key]
      if (!direction) return
      e.preventDefault()
      handleDirection(direction)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleDirection])

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current
      touchStartRef.current = null
      if (!start) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) return
      const direction: Direction =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
      handleDirection(direction)
    },
    [handleDirection],
  )

  const handleNewGame = useCallback(() => {
    setState(newGame(Math.random))
    setBestAtStart(bestScoreStore.load())
  }, [])

  const isNewBest = state.score > 0 && (bestAtStart === null || state.score > bestAtStart)

  return (
    <main className="max-w-md mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">
          {MESSAGES.scoreLabel}{' '}
          <span data-testid="score" className="font-bold text-foreground">
            {state.score}
          </span>
        </span>
        {bestScore !== null && (
          <span className="text-muted-foreground">
            {MESSAGES.bestLabel} <span className="font-bold text-foreground">{bestScore}</span>
          </span>
        )}
        <Button onClick={handleNewGame} variant="outline" size="sm">
          {MESSAGES.newGame}
        </Button>
      </div>

      <div
        role="group"
        aria-label={MESSAGES.boardLabel}
        className="grid grid-cols-4 gap-2 sm:gap-3 aspect-square p-2 sm:p-3 rounded-xl bg-stone-300 dark:bg-stone-700 select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {state.board.map((row, r) =>
          row.map((value, c) => {
            const isSpawned = state.spawned?.row === r && state.spawned?.col === c
            const isMerged = state.merged.some((p) => p.row === r && p.col === c)
            return (
              <div
                // Keying on the value remounts a cell when its tile changes, so the
                // pop animation replays even when the same cell animates twice in a row.
                key={`${r}-${c}-${value}`}
                data-value={value}
                className={cn(
                  'flex items-center justify-center rounded-lg font-bold tabular-nums',
                  value === 0 ? 'bg-stone-200 dark:bg-stone-600' : (TILE_STYLES[value] ?? SUPER_TILE_STYLE),
                  value !== 0 && tileTextSize(value),
                  isSpawned && 'animate-pop-in',
                  isMerged && 'animate-tile-merge',
                )}
              >
                {value !== 0 && value}
              </div>
            )
          }),
        )}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">{MESSAGES.instructions}</p>

      <Dialog
        open={state.status === 'won'}
        onOpenChange={(open) => {
          if (!open) setState((prev) => keepGoing(prev))
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <Trophy className="h-12 w-12 text-primary" aria-hidden="true" />
            <DialogTitle>{MESSAGES.winTitle}</DialogTitle>
            <DialogDescription>{MESSAGES.winDescription(state.score)}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleNewGame} className="w-full sm:w-auto">
              {MESSAGES.newGame}
            </Button>
            <Button onClick={() => setState((prev) => keepGoing(prev))} className="w-full sm:w-auto">
              {MESSAGES.keepGoing}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={state.status === 'over'}
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
              {MESSAGES.newGame}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
