export type ModuleCategory = 'utilities' | 'games' | 'apis'

export type Module = {
  slug: string
  title: string
  description: string
  category: ModuleCategory
  tags: string[]
  createdAt: string
  icon?: string
}

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  utilities: 'Utilities',
  games: 'Games',
  apis: 'APIs',
}

export const CATEGORY_BADGE_LABELS: Record<ModuleCategory, string> = {
  utilities: 'UTILITY',
  games: 'GAME',
  apis: 'API',
}
