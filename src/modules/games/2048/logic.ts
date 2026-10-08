export type Direction = 'up' | 'down' | 'left' | 'right'
export type Status = 'playing' | 'won' | 'over'
/** 4×4 grid, row-major, 0 = empty cell. */
export type Board = number[][]
export type Rng = () => number

export interface Position {
  row: number
  col: number
}

export interface GameState {
  board: Board
  score: number
  status: Status
  /** True once the player chose "Keep going" after reaching 2048. */
  keepPlaying: boolean
  /** Tile spawned by the last move, for the pop-in animation. */
  spawned: Position | null
  /** Cells produced by a merge in the last move, for the pulse animation. */
  merged: Position[]
}

export const BOARD_SIZE = 4
export const WIN_TILE = 2048
export const FOUR_PROBABILITY = 0.1
const STARTING_TILES = 2

/** Slides one row towards index 0, merging each equal adjacent pair once. */
export function slideRow(row: number[]): { row: number[]; gained: number; mergedAt: number[] } {
  const tiles = row.filter((value) => value !== 0)
  const result: number[] = []
  const mergedAt: number[] = []
  let gained = 0
  for (let i = 0; i < tiles.length; i++) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const sum = tiles[i] * 2
      mergedAt.push(result.length)
      result.push(sum)
      gained += sum
      i++
    } else {
      result.push(tiles[i])
    }
  }
  while (result.length < row.length) result.push(0)
  return { row: result, gained, mergedAt }
}

function transpose(board: Board): Board {
  return board[0].map((_, col) => board.map((row) => row[col]))
}

function reverseRows(board: Board): Board {
  return board.map((row) => [...row].reverse())
}

// Each direction is handled by rotating the board so the move becomes "slide left",
// sliding every row, then applying the inverse transform.
const TO_LEFT: Record<Direction, (board: Board) => Board> = {
  left: (board) => board,
  right: reverseRows,
  up: transpose,
  down: (board) => reverseRows(transpose(board)),
}

const FROM_LEFT: Record<Direction, (board: Board) => Board> = {
  left: (board) => board,
  right: reverseRows,
  up: transpose,
  down: (board) => transpose(reverseRows(board)),
}

/** Maps a cell in the "slide left" orientation back to board coordinates. */
function toBoardPosition(direction: Direction, row: number, col: number): Position {
  const last = BOARD_SIZE - 1
  switch (direction) {
    case 'left':
      return { row, col }
    case 'right':
      return { row, col: last - col }
    case 'up':
      return { row: col, col: row }
    case 'down':
      return { row: last - col, col: row }
  }
}

export function slideBoard(
  board: Board,
  direction: Direction,
): { board: Board; gained: number; merged: Position[]; moved: boolean } {
  let gained = 0
  const merged: Position[] = []
  const slid = TO_LEFT[direction](board).map((row, r) => {
    const result = slideRow(row)
    gained += result.gained
    for (const c of result.mergedAt) merged.push(toBoardPosition(direction, r, c))
    return result.row
  })
  const next = FROM_LEFT[direction](slid)
  const moved = next.some((row, r) => row.some((value, c) => value !== board[r][c]))
  return { board: next, gained, merged, moved }
}

/** Places a 2 (or, with FOUR_PROBABILITY, a 4) in a random empty cell. Calls rng twice. */
export function spawnTile(board: Board, rng: Rng): { board: Board; position: Position } | null {
  const empty: Position[] = []
  board.forEach((row, r) =>
    row.forEach((value, c) => {
      if (value === 0) empty.push({ row: r, col: c })
    }),
  )
  if (empty.length === 0) return null
  const position = empty[Math.floor(rng() * empty.length)]
  const value = rng() < FOUR_PROBABILITY ? 4 : 2
  const next = board.map((row) => [...row])
  next[position.row][position.col] = value
  return { board: next, position }
}

export function canMove(board: Board): boolean {
  return board.some((row, r) =>
    row.some(
      (value, c) =>
        value === 0 ||
        (c + 1 < BOARD_SIZE && row[c + 1] === value) ||
        (r + 1 < BOARD_SIZE && board[r + 1][c] === value),
    ),
  )
}

function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<number>(BOARD_SIZE).fill(0))
}

export function newGame(rng: Rng): GameState {
  let board = emptyBoard()
  for (let i = 0; i < STARTING_TILES; i++) {
    const spawn = spawnTile(board, rng)
    if (spawn) board = spawn.board
  }
  return { board, score: 0, status: 'playing', keepPlaying: false, spawned: null, merged: [] }
}

export function move(state: GameState, direction: Direction, rng: Rng): GameState {
  if (state.status !== 'playing') return state
  const slid = slideBoard(state.board, direction)
  if (!slid.moved) return state

  const spawn = spawnTile(slid.board, rng)
  const board = spawn ? spawn.board : slid.board
  const reachedWin = !state.keepPlaying && board.some((row) => row.some((value) => value >= WIN_TILE))
  const status: Status = reachedWin ? 'won' : canMove(board) ? 'playing' : 'over'

  return {
    board,
    score: state.score + slid.gained,
    status,
    keepPlaying: state.keepPlaying,
    spawned: spawn ? spawn.position : null,
    merged: slid.merged,
  }
}

export function keepGoing(state: GameState): GameState {
  if (state.status !== 'won') return state
  return { ...state, keepPlaying: true, status: canMove(state.board) ? 'playing' : 'over' }
}
