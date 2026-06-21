import { Module, ModuleCategory } from './types'
import { unitConverterMeta } from '@/modules/utilities/unit-converter/meta'
import { base64ConverterMeta } from '@/modules/utilities/base64-converter/meta'
import { passwordStrengthCheckerMeta } from '@/modules/utilities/password-strength-checker/meta'
import { memoryCardMeta } from '@/modules/games/memory-card/meta'
import { typingSpeedTestMeta } from '@/modules/games/typing-speed-test/meta'
import { reactionTimeTestMeta } from '@/modules/games/reaction-time-test/meta'

export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, passwordStrengthCheckerMeta, memoryCardMeta, typingSpeedTestMeta, reactionTimeTestMeta]

export function getModulesByCategory(category: ModuleCategory) {
  return registry.filter((m) => m.category === category)
}

export function getModuleBySlug(slug: string) {
  return registry.find((m) => m.slug === slug)
}

