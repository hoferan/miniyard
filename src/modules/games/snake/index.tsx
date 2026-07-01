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
import {
  GRID_SIZE,
  type Direction,
  type GameState,
  createInitialState,
  startGame,
  changeDirection,
  tick,
  getTickIntervalMs,
} from './logic'
import { MESSAGES } from './messages'
import { createHighScoreStore } from '@/lib/high-score'

const bestScoreStore = createHighScoreStore('snake:high-score')

const SWIPE_THRESHOLD_PX = 20

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export default function Snake() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setBestScore(bestScoreStore.load())
  }, [])

  useEffect(() => {
    if (state.phase !== 'playing') return
    const intervalMs = getTickIntervalMs(state.score)
    const id = setInterval(() => {
      setState((prev) => tick(prev))
    }, intervalMs)
    return () => clearInterval(id)
  }, [state.phase, state.score])

  useEffect(() => {
    if (state.phase === 'gameover') {
      const prev = bestScoreStore.load()
      const improved = prev === null || state.score > prev
      if (improved) bestScoreStore.save(state.score)
      setBestScore(improved ? state.score : prev)
      setIsNewBest(improved)
    }
  }, [state.phase, state.score])

  const handleDirection = useCallback((direction: Direction) => {
    setState((prev) => {
      if (prev.phase === 'idle') return changeDirection(startGame(prev), direction)
      return changeDirection(prev, direction)
    })
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
    [handleDirection]
  )

  const handleNewGame = useCallback(() => {
    setState(createInitialState())
    setIsNewBest(false)
  }, [])

  const snakeCellSet = new Set(state.snake.map((c) => `${c.x},${c.y}`))
  const headKey = `${state.snake[0].x},${state.snake[0].y}`

  return (
    <main className="max-w-md mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">
          {MESSAGES.scoreLabel} <span className="font-bold text-foreground">{state.score}</span>
        </span>
        {bestScore !== null && (
          <span className="text-muted-foreground">
            {MESSAGES.bestLabel} <span className="font-bold text-foreground">{bestScore}</span>
          </span>
        )}
      </div>

      <div
        role="img"
        aria-label="Snake game board"
        className="grid gap-px bg-border aspect-square select-none touch-none rounded-lg overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE
          const y = Math.floor(index / GRID_SIZE)
          const key = `${x},${y}`
          const isHead = key === headKey
          const isSnake = snakeCellSet.has(key)
          const isFood = state.food.x === x && state.food.y === y
          return (
            <div
              key={key}
              className={cn(
                'aspect-square bg-background',
                isSnake && !isHead && 'bg-primary/70',
                isHead && 'bg-primary',
                isFood && 'bg-green-500'
              )}
            />
          )
        })}
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={handleNewGame} variant="outline">
          {MESSAGES.newGame}
        </Button>
      </div>

      <Dialog open={state.phase === 'idle'} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
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
