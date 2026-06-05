export type ModuleCategory = 'utilities' | 'games'

export type ModuleStatus = 'stable' | 'beta' | 'coming-soon'

export type Module = {
  slug: string
  title: string
  description: string
  category: ModuleCategory
  icon: string
  tags: string[]
  status: ModuleStatus
  isPro?: boolean
  requiresAuth?: boolean
}
