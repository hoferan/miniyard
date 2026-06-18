'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  GameState,
  WORD_LIST,
  createInitialState,
  generatePassage,
  getResults,
  handleKeypress,
  tick,
} from './logic'

const PASSAGE_WORD_COUNT = 90
const PERSONAL_BEST_KEY = 'typing-speed-test:personal-best'

function loadPersonalBest(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(PERSONAL_BEST_KEY)
  return stored ? Number(stored) : 0
}

function savePersonalBest(wpm: number): void {
  localStorage.setItem(PERSONAL_BEST_KEY, String(Math.round(wpm)))
}

function newGame(): GameState {
  return createInitialState(generatePassage(WORD_LIST, PASSAGE_WORD_COUNT))
}

export default function TypingSpeedTest() {
  const [state, setState] = useState<GameState>(newGame)
  const [now, setNow] = useState(() => Date.now())
  const [personalBest, setPersonalBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setPersonalBest(loadPersonalBest())
  }, [])

  // Tick every 100 ms while playing to update countdown and detect expiry
  useEffect(() => {
    if (state.phase === 'playing') {
      timerRef.current = setInterval(() => {
        const currentNow = Date.now()
        setNow(currentNow)
        setState((prev) => tick(prev, currentNow))
      }, 100)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.phase])

  // Save personal best when game finishes
  useEffect(() => {
    if (state.phase !== 'finished' || state.startedAt === null) return
    const results = getResults(state, now)
    const pb = loadPersonalBest()
    if (results.wpm > pb) {
      savePersonalBest(results.wpm)
      setPersonalBest(Math.round(results.wpm))
      setIsNewBest(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // Desktop: reliable keydown gives us exact key names including Backspace
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (state.phase === 'finished') return
    if (
      e.key === 'Backspace' ||
      (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)
    ) {
      e.preventDefault()
      const currentNow = Date.now()
      setNow(currentNow)
      setState((prev) => handleKeypress(prev, e.key, currentNow))
    }
  }, [state.phase])

  // Mobile fallback: InputEvent.data carries the typed character; null signals deletion
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const currentNow = Date.now()
    const native = e.nativeEvent as InputEvent
    if (native.inputType === 'deleteContentBackward') {
      setNow(currentNow)
      setState((prev) => handleKeypress(prev, 'Backspace', currentNow))
    } else if (native.data) {
      setNow(currentNow)
      setState((prev) => handleKeypress(prev, native.data as string, currentNow))
    }
    // Reset to keep the input visually empty
    e.currentTarget.value = ''
  }, [])

  const handleRestart = useCallback(() => {
    setState(newGame())
    setNow(Date.now())
    setIsNewBest(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const elapsed = state.startedAt !== null ? (state.endedAt ?? now) - state.startedAt : 0
  const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000))
  const results = state.phase === 'finished' ? getResults(state, now) : null
  const liveResults = state.phase === 'playing' && elapsed > 0 ? getResults(state, now) : null

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Stats bar */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <span
          className={cn(
            'tabular-nums font-medium',
            state.phase === 'playing' && remaining <= 10
              ? 'text-destructive font-bold'
              : 'text-muted-foreground'
          )}
        >
          {state.phase === 'idle' && '60 s'}
          {state.phase === 'playing' && `${remaining} s`}
          {state.phase === 'finished' && 'Done'}
        </span>
        <div className="flex gap-4 text-muted-foreground">
          {liveResults !== null && (
            <span className="tabular-nums">{Math.round(liveResults.wpm)} WPM</span>
          )}
          {personalBest > 0 && (
            <span className="tabular-nums">Best: {personalBest} WPM</span>
          )}
        </div>
      </div>

      {/* Passage display */}
      {state.phase !== 'finished' && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Typing area — click to focus and start typing"
          className={cn(
            'relative cursor-text select-none rounded-xl border bg-card p-6 font-mono text-base leading-8 shadow-sm focus-within:ring-2 focus-within:ring-ring sm:text-lg',
          )}
          onClick={focusInput}
          onKeyDown={(e) => e.key === 'Enter' && focusInput()}
        >
          {state.phase === 'idle' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/90 backdrop-blur-[2px]">
              <span className="text-sm text-muted-foreground">Click here and start typing</span>
            </div>
          )}
          {state.passage.split('').map((char, i) => {
            const charState = state.charStates[i]
            const isCurrent = i === state.currentIndex
            return (
              <span
                key={i}
                className={cn(
                  isCurrent && charState === 'pending' && 'border-l-2 border-foreground animate-pulse',
                  charState === 'correct' && 'text-green-600 dark:text-green-400',
                  charState === 'incorrect' &&
                    'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-sm',
                  charState === 'pending' && !isCurrent && 'text-muted-foreground/50',
                  isCurrent && charState === 'pending' && 'text-foreground',
                )}
              >
                {char === ' ' ? ' ' : char}
              </span>
            )
          })}
          {/* Hidden input captures all keyboard input (including mobile soft keyboard) */}
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute left-0 top-0 h-full w-full opacity-0 cursor-default"
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            aria-hidden="true"
            tabIndex={0}
          />
        </div>
      )}

      {/* Results card */}
      {state.phase === 'finished' && results && (
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-center text-xl font-bold">Results</h2>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-4xl font-extrabold text-primary tabular-nums">
                {Math.round(results.wpm)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">WPM</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-4xl font-extrabold tabular-nums">
                {Math.round(results.accuracy)}%
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-4xl font-extrabold tabular-nums">{results.charsTyped}</div>
              <div className="mt-1 text-sm text-muted-foreground">Characters</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-4xl font-extrabold tabular-nums">{results.errorCount}</div>
              <div className="mt-1 text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
          {isNewBest && (
            <p className="mb-4 text-center text-sm font-semibold text-primary">
              New personal best!
            </p>
          )}
          <Button className="w-full" onClick={handleRestart}>
            Try again
          </Button>
        </div>
      )}
    </main>
  )
}
