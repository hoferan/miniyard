import { describe, it, expect } from 'vitest'
import { sortModulesByNewest } from './registry'
import type { Module } from './types'

function makeModule(overrides: Partial<Module> & Pick<Module, 'slug' | 'createdAt'>): Module {
  return {
    title: 'Test Module',
    description: 'A test module',
    category: 'utilities',
    tags: [],
    ...overrides,
  }
}

describe('sortModulesByNewest', () => {
  it('sorts modules newest first', () => {
    const older = makeModule({ slug: 'older', createdAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeModule({ slug: 'newer', createdAt: '2026-03-01T00:00:00.000Z' })
    const middle = makeModule({ slug: 'middle', createdAt: '2026-02-01T00:00:00.000Z' })

    const result = sortModulesByNewest([older, newer, middle])

    expect(result.map((m) => m.slug)).toEqual(['newer', 'middle', 'older'])
  })

  it('preserves original relative order for modules with identical createdAt', () => {
    const first = makeModule({ slug: 'first', createdAt: '2026-01-01T00:00:00.000Z' })
    const second = makeModule({ slug: 'second', createdAt: '2026-01-01T00:00:00.000Z' })

    const result = sortModulesByNewest([first, second])

    expect(result.map((m) => m.slug)).toEqual(['first', 'second'])
  })

  it('does not mutate the input array', () => {
    const older = makeModule({ slug: 'older', createdAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeModule({ slug: 'newer', createdAt: '2026-02-01T00:00:00.000Z' })
    const input = [older, newer]

    sortModulesByNewest(input)

    expect(input.map((m) => m.slug)).toEqual(['older', 'newer'])
  })
})
