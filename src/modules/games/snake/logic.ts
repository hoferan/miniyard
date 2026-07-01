export const GRID_SIZE = 16

export type Direction = 'up' | 'down' | 'left' | 'right'
export type GamePhase = 'idle' | 'playing' | 'gameover'

export interface Cell {
  x: number
  y: number
}

export interface GameState {
  snake: Cell[]
  direction: Direction
  food: Cell
  score: number
  phase: GamePhase
}

const DIRECTION_VECTORS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

export function placeFood(
  snakeCells: Cell[],
  gridSize: number,
  random: () => number = Math.random
): Cell {
  const occupied = new Set(snakeCells.map((c) => `${c.x},${c.y}`))
  const emptyCells: Cell[] = []
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) emptyCells.push({ x, y })
    }
  }
  const index = Math.floor(random() * emptyCells.length)
  return emptyCells[index]
}

export function getTickIntervalMs(score: number): number {
  const interval = 200 - Math.floor(score / 5) * 15
  return Math.max(interval, 80)
}

export function createInitialState(random: () => number = Math.random): GameState {
  const center = Math.floor(GRID_SIZE / 2)
  const snake: Cell[] = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ]
  return {
    snake,
    direction: 'right',
    food: placeFood(snake, GRID_SIZE, random),
    score: 0,
    phase: 'idle',
  }
}

export function startGame(state: GameState): GameState {
  if (state.phase !== 'idle') return state
  return { ...state, phase: 'playing' }
}

export function changeDirection(state: GameState, direction: Direction): GameState {
  if (state.phase !== 'playing') return state
  if (OPPOSITE_DIRECTION[state.direction] === direction) return state
  return { ...state, direction }
}

export function tick(state: GameState, random: () => number = Math.random): GameState {
  if (state.phase !== 'playing') return state

  const vector = DIRECTION_VECTORS[state.direction]
  const head = state.snake[0]
  const newHead: Cell = { x: head.x + vector.x, y: head.y + vector.y }

  const hitWall =
    newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE
  if (hitWall) {
    return { ...state, phase: 'gameover' }
  }

  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1)
  const hitSelf = bodyToCheck.some((cell) => cell.x === newHead.x && cell.y === newHead.y)
  if (hitSelf) {
    return { ...state, phase: 'gameover' }
  }

  if (!ateFood) {
    return { ...state, snake: [newHead, ...state.snake.slice(0, -1)] }
  }

  const newSnake = [newHead, ...state.snake]
  return {
    ...state,
    snake: newSnake,
    score: state.score + 1,
    food: placeFood(newSnake, GRID_SIZE, random),
  }
}
