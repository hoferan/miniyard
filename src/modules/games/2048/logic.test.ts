import { describe, it, expect } from 'vitest'
import {
  type Board,
  type GameState,
  type Rng,
  canMove,
  keepGoing,
  move,
  newGame,
  slideBoard,
  slideRow,
  spawnTile,
} from './logic'

/** Deterministic rng: returns the given values in order, cycling. */
function seq(...values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]
}

function stateWith(board: Board, overrides: Partial<GameState> = {}): GameState {
  return {
    board,
    score: 0,
    status: 'playing',
    keepPlaying: false,
    spawned: null,
    merged: [],
    ...overrides,
  }
}

const EMPTY: Board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]

// Rows 1–3 of a full board with no equal neighbours, reused by game-over tests.
const STUCK_ROWS: number[][] = [
  [8, 16, 32, 64],
  [16, 32, 64, 128],
  [32, 64, 128, 256],
]

describe('slideRow', () => {
  it('leaves an empty row unchanged', () => {
    expect(slideRow([0, 0, 0, 0])).toEqual({ row: [0, 0, 0, 0], gained: 0, mergedAt: [] })
  })

  it('leaves a packed row without pairs unchanged', () => {
    expect(slideRow([2, 4, 8, 16])).toEqual({ row: [2, 4, 8, 16], gained: 0, mergedAt: [] })
  })

  it('packs tiles to the left across gaps', () => {
    expect(slideRow([0, 2, 0, 4])).toEqual({ row: [2, 4, 0, 0], gained: 0, mergedAt: [] })
  })

  it('merges a pair separated by a gap', () => {
    expect(slideRow([2, 0, 2, 0])).toEqual({ row: [4, 0, 0, 0], gained: 4, mergedAt: [0] })
  })

  it('merges [2,2,2,2] into two 4s, not one 8', () => {
    expect(slideRow([2, 2, 2, 2])).toEqual({ row: [4, 4, 0, 0], gained: 8, mergedAt: [0, 1] })
  })

  it('does not merge a freshly merged tile again in the same move', () => {
    expect(slideRow([4, 4, 8, 0])).toEqual({ row: [8, 8, 0, 0], gained: 8, mergedAt: [0] })
  })

  it('merges the leading pair first when three equal tiles line up', () => {
    expect(slideRow([2, 2, 2, 0])).toEqual({ row: [4, 2, 0, 0], gained: 4, mergedAt: [0] })
  })

  it('does not mutate the input row', () => {
    const row = [2, 2, 0, 0]
    slideRow(row)
    expect(row).toEqual([2, 2, 0, 0])
  })
})

describe('slideBoard', () => {
  const board: Board = [
    [2, 2, 0, 0],
    [0, 4, 0, 4],
    [0, 0, 0, 0],
    [2, 0, 0, 0],
  ]

  it('slides left', () => {
    expect(slideBoard(board, 'left')).toEqual({
      board: [
        [4, 0, 0, 0],
        [8, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 0, 0],
      ],
      gained: 12,
      merged: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
      ],
      moved: true,
    })
  })

  it('slides right', () => {
    expect(slideBoard(board, 'right')).toEqual({
      board: [
        [0, 0, 0, 4],
        [0, 0, 0, 8],
        [0, 0, 0, 0],
        [0, 0, 0, 2],
      ],
      gained: 12,
      merged: [
        { row: 0, col: 3 },
        { row: 1, col: 3 },
      ],
      moved: true,
    })
  })

  it('slides up', () => {
    expect(slideBoard(board, 'up')).toEqual({
      board: [
        [4, 2, 0, 4],
        [0, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      gained: 4,
      merged: [{ row: 0, col: 0 }],
      moved: true,
    })
  })

  it('slides down', () => {
    expect(slideBoard(board, 'down')).toEqual({
      board: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 2, 0, 0],
        [4, 4, 0, 4],
      ],
      gained: 4,
      merged: [{ row: 3, col: 0 }],
      moved: true,
    })
  })

  it('reports moved: false when nothing can slide', () => {
    const packed: Board = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(slideBoard(packed, 'left').moved).toBe(false)
  })
})

describe('spawnTile', () => {
  it('places a 2 in the cell picked by the first rng call', () => {
    const result = spawnTile(EMPTY, seq(0, 0.5))
    expect(result?.position).toEqual({ row: 0, col: 0 })
    expect(result?.board[0][0]).toBe(2)
  })

  it('places a 4 when the second rng call is below the four-probability', () => {
    const result = spawnTile(EMPTY, seq(0.99, 0.05))
    expect(result?.position).toEqual({ row: 3, col: 3 })
    expect(result?.board[3][3]).toBe(4)
  })

  it('only picks empty cells', () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 0, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    const result = spawnTile(board, seq(0.7, 0.9))
    expect(result?.position).toEqual({ row: 1, col: 1 })
  })

  it('returns null on a full board', () => {
    const full: Board = [[2, 4, 2, 4], ...STUCK_ROWS]
    expect(spawnTile(full, seq(0.5))).toBeNull()
  })

  it('does not mutate the input board', () => {
    const board = EMPTY.map((row) => [...row])
    spawnTile(board, seq(0, 0.5))
    expect(board).toEqual(EMPTY)
  })
})

describe('canMove', () => {
  it('is true when a cell is empty', () => {
    expect(canMove([[0, 4, 2, 4], ...STUCK_ROWS])).toBe(true)
  })

  it('is true on a full board with a horizontal pair', () => {
    expect(canMove([[2, 2, 4, 8], ...STUCK_ROWS])).toBe(true)
  })

  it('is true on a full board with a vertical pair', () => {
    expect(canMove([[8, 4, 2, 4], ...STUCK_ROWS])).toBe(true)
  })

  it('is false on a full board with no equal neighbours', () => {
    expect(canMove([[2, 4, 2, 4], ...STUCK_ROWS])).toBe(false)
  })
})

describe('newGame', () => {
  it('starts with exactly two tiles, score 0 and status playing', () => {
    const state = newGame(seq(0, 0.5, 0, 0.5))
    const tiles = state.board.flat().filter((v) => v !== 0)
    expect(tiles).toEqual([2, 2])
    expect(state.board[0][0]).toBe(2)
    expect(state.board[0][1]).toBe(2)
    expect(state.score).toBe(0)
    expect(state.status).toBe('playing')
    expect(state.keepPlaying).toBe(false)
    expect(state.spawned).toBeNull()
    expect(state.merged).toEqual([])
  })
})

describe('move', () => {
  const board: Board = [
    [2, 2, 0, 0],
    [0, 4, 0, 4],
    [0, 0, 0, 0],
    [2, 0, 0, 0],
  ]

  it('slides, scores, records merges and spawns one tile', () => {
    const next = move(stateWith(board), 'left', seq(0, 0.5))
    expect(next.board).toEqual([
      [4, 2, 0, 0],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
    ])
    expect(next.score).toBe(12)
    expect(next.spawned).toEqual({ row: 0, col: 1 })
    expect(next.merged).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
    ])
    expect(next.status).toBe('playing')
  })

  it('adds to the existing score', () => {
    expect(move(stateWith(board, { score: 100 }), 'left', seq(0, 0.5)).score).toBe(112)
  })

  it('returns the same state when the move changes nothing', () => {
    const packed = stateWith([
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(move(packed, 'left', seq(0, 0.5))).toBe(packed)
  })

  it('ignores moves while the win dialog is showing', () => {
    const won = stateWith(board, { status: 'won' })
    expect(move(won, 'left', seq(0, 0.5))).toBe(won)
  })

  it('ignores moves after game over', () => {
    const over = stateWith(board, { status: 'over' })
    expect(move(over, 'left', seq(0, 0.5))).toBe(over)
  })

  it('sets status won when a 2048 tile first appears', () => {
    const next = move(
      stateWith([
        [1024, 1024, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]),
      'left',
      seq(0, 0.5),
    )
    expect(next.board[0][0]).toBe(2048)
    expect(next.status).toBe('won')
  })

  it('does not win again after the player chose to keep going', () => {
    const next = move(
      stateWith(
        [
          [2048, 0, 0, 0],
          [2, 2, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        { keepPlaying: true },
      ),
      'left',
      seq(0.5, 0.5),
    )
    expect(next.status).toBe('playing')
  })

  it('sets status over when the board fills with no moves left', () => {
    const next = move(stateWith([[2, 2, 8, 16], ...STUCK_ROWS]), 'left', seq(0, 0.05))
    expect(next.board[0]).toEqual([4, 8, 16, 4])
    expect(next.status).toBe('over')
  })

  it('prefers won over over when 2048 appears on a stuck board', () => {
    const next = move(stateWith([[1024, 1024, 8, 16], ...STUCK_ROWS]), 'left', seq(0, 0.05))
    expect(next.board[0]).toEqual([2048, 8, 16, 4])
    expect(next.status).toBe('won')
  })
})

describe('keepGoing', () => {
  it('resumes play and remembers the choice', () => {
    const next = keepGoing(
      stateWith(
        [
          [2048, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        { status: 'won' },
      ),
    )
    expect(next.status).toBe('playing')
    expect(next.keepPlaying).toBe(true)
  })

  it('goes straight to over when the board has no moves left', () => {
    const next = keepGoing(stateWith([[2048, 8, 16, 4], ...STUCK_ROWS], { status: 'won' }))
    expect(next.status).toBe('over')
  })

  it('leaves non-won states unchanged', () => {
    const playing = stateWith(EMPTY)
    expect(keepGoing(playing)).toBe(playing)
  })
})
