import { Module, ModuleCategory } from './types'
import { unitConverterMeta } from '@/modules/utilities/unit-converter/meta'
import { base64ConverterMeta } from '@/modules/utilities/base64-converter/meta'
import { memoryCardMeta } from '@/modules/games/memory-card/meta'

export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, memoryCardMeta]

export function getModulesByCategory(category: ModuleCategory) {
  return registry.filter((m) => m.category === category)
}

export function getModuleBySlug(slug: string) {
  return registry.find((m) => m.slug === slug)
}
