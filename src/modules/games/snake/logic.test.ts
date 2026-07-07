import { describe, it, expect } from 'vitest'
import {
  GRID_SIZE,
  createInitialState,
  startGame,
  changeDirection,
  tick,
  getTickIntervalMs,
  placeFood,
  type Cell,
} from './logic'

describe('createInitialState', () => {
  it('creates a snake of length 3, centered, facing right', () => {
    const state = createInitialState()
    const center = Math.floor(GRID_SIZE / 2)
    expect(state.snake).toEqual([
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ])
    expect(state.direction).toBe('right')
  })

  it('starts in idle phase with zero score', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.score).toBe(0)
  })

  it('places food on a cell not occupied by the snake', () => {
    const state = createInitialState()
    const onSnake = state.snake.some((c) => c.x === state.food.x && c.y === state.food.y)
    expect(onSnake).toBe(false)
  })
})

describe('startGame', () => {
  it('transitions idle to playing', () => {
    const state = createInitialState()
    expect(startGame(state).phase).toBe('playing')
  })

  it('does nothing if already playing', () => {
    const state = startGame(createInitialState())
    expect(startGame(state)).toEqual(state)
  })
})

describe('changeDirection', () => {
  it('updates direction for a valid turn while playing', () => {
    const state = startGame(createInitialState())
    const next = changeDirection(state, 'up')
    expect(next.direction).toBe('up')
  })

  it('ignores a 180 degree reversal', () => {
    const state = startGame(createInitialState())
    const next = changeDirection(state, 'left')
    expect(next.direction).toBe('right')
  })

  it('is ignored while idle', () => {
    const state = createInitialState()
    const next = changeDirection(state, 'up')
    expect(next.direction).toBe('right')
  })

  it('is ignored after game over', () => {
    const playing = startGame(createInitialState())
    const state = { ...playing, phase: 'gameover' as const }
    const next = changeDirection(state, 'up')
    expect(next.direction).toBe('right')
  })
})

describe('tick', () => {
  it('moves the snake one cell forward without growing when no food is eaten', () => {
    const center = Math.floor(GRID_SIZE / 2)
    const state = { ...startGame(createInitialState()), food: { x: 0, y: 0 } }
    const next = tick(state)
    expect(next.snake[0]).toEqual({ x: center + 1, y: center })
    expect(next.snake).toHaveLength(3)
    expect(next.score).toBe(0)
  })

  it('grows the snake and increments score when food is eaten', () => {
    const playing = startGame(createInitialState())
    const head = playing.snake[0]
    const state = { ...playing, food: { x: head.x + 1, y: head.y } }
    const next = tick(state, () => 0.5)
    expect(next.snake).toHaveLength(4)
    expect(next.score).toBe(1)
    const onSnake = next.snake.some((c) => c.x === next.food.x && c.y === next.food.y)
    expect(onSnake).toBe(false)
  })

  it('ends the game when the snake hits the right wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: GRID_SIZE - 1, y: 5 },
      { x: GRID_SIZE - 2, y: 5 },
      { x: GRID_SIZE - 3, y: 5 },
    ]
    const state = { ...playing, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits the left wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }]
    const state = { ...playing, direction: 'left' as const, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits the top wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }]
    const state = { ...playing, direction: 'up' as const, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits the bottom wall', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: 5, y: GRID_SIZE - 1 },
      { x: 5, y: GRID_SIZE - 2 },
      { x: 5, y: GRID_SIZE - 3 },
    ]
    const state = { ...playing, direction: 'down' as const, snake }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('ends the game when the snake hits its own body', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
      { x: 5, y: 4 },
    ]
    const state = { ...playing, direction: 'right' as const, snake, food: { x: 15, y: 15 } }
    const next = tick(state)
    expect(next.phase).toBe('gameover')
  })

  it('does not falsely trigger self collision on the cell the tail is vacating', () => {
    const playing = startGame(createInitialState())
    const snake: Cell[] = [
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 6, y: 5 },
    ]
    const state = { ...playing, direction: 'right' as const, snake, food: { x: 15, y: 15 } }
    const next = tick(state)
    expect(next.phase).toBe('playing')
  })

  it('does not change state when not playing', () => {
    const state = createInitialState()
    const next = tick(state)
    expect(next).toEqual(state)
  })
})

describe('getTickIntervalMs', () => {
  it('returns 200 at score 0', () => {
    expect(getTickIntervalMs(0)).toBe(200)
  })

  it('decreases by 15 every 5 pellets', () => {
    expect(getTickIntervalMs(5)).toBe(185)
    expect(getTickIntervalMs(10)).toBe(170)
  })

  it('floors at 80', () => {
    expect(getTickIntervalMs(1000)).toBe(80)
  })
})

describe('placeFood', () => {
  it('never returns a cell occupied by the snake', () => {
    const snake: Cell[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }]
    for (let i = 0; i < 20; i++) {
      const food = placeFood(snake, 2, () => i / 20)
      const onSnake = snake.some((c) => c.x === food.x && c.y === food.y)
      expect(onSnake).toBe(false)
    }
  })
})
