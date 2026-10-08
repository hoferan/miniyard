import { test, expect, type Locator } from '@playwright/test'

async function tileSum(board: Locator): Promise<number> {
  const values = await board.locator('[data-value]').evaluateAll((cells) =>
    cells.map((cell) => Number(cell.getAttribute('data-value'))),
  )
  return values.reduce((sum, value) => sum + value, 0)
}

test.describe('2048', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/2048')
  })

  test('loads with score 0 and two starting tiles', async ({ page }) => {
    const board = page.getByRole('group', { name: '2048 game board' })
    await expect(board).toBeVisible()
    await expect(board.locator('[data-value]')).toHaveCount(16)
    await expect(board.locator('[data-value]:not([data-value="0"])')).toHaveCount(2)
    await expect(page.getByTestId('score')).toHaveText('0')
    await page.screenshot({ path: 'test-results/2048-initial.png' })
  })

  test('arrow keys slide the tiles and spawn new ones', async ({ page }) => {
    const board = page.getByRole('group', { name: '2048 game board' })
    await expect(board.locator('[data-value]:not([data-value="0"])')).toHaveCount(2)
    const before = await tileSum(board)

    // At least one of the four directions changes a two-tile board, and every
    // effective move spawns a tile, so the sum of tile values must grow.
    for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) {
      await page.keyboard.press(key)
    }

    await expect.poll(() => tileSum(board)).toBeGreaterThan(before)
    await page.screenshot({ path: 'test-results/2048-after-moves.png' })
  })
})
