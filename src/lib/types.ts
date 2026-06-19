export type ModuleCategory = 'utilities' | 'games'

export type Module = {
  slug: string
  title: string
  description: string
  category: ModuleCategory
  tags: string[]
  createdAt: string
}
