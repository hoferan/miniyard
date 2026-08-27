import { Module, ModuleCategory } from './types'
import { unitConverterMeta } from '@/modules/utilities/unit-converter/meta'
import { base64ConverterMeta } from '@/modules/utilities/base64-converter/meta'
import { passwordStrengthCheckerMeta } from '@/modules/utilities/password-strength-checker/meta'
import { colorConverterMeta } from '@/modules/utilities/color-converter/meta'
import { textCaseConverterMeta } from '@/modules/utilities/text-case-converter/meta'
import { memoryCardMeta } from '@/modules/games/memory-card/meta'
import { typingSpeedTestMeta } from '@/modules/games/typing-speed-test/meta'
import { reactionTimeTestMeta } from '@/modules/games/reaction-time-test/meta'
import { snakeMeta } from '@/modules/games/snake/meta'
import { colourSequenceMemoryMeta } from '@/modules/games/colour-sequence-memory/meta'
import { currencyConverterMeta } from '@/modules/apis/currency-converter/meta'
import { randomJokeMeta } from '@/modules/apis/random-joke/meta'
import { publicHolidaysMeta } from '@/modules/apis/public-holidays/meta'

export const registry: Module[] = [unitConverterMeta, base64ConverterMeta, passwordStrengthCheckerMeta, colorConverterMeta, textCaseConverterMeta, memoryCardMeta, typingSpeedTestMeta, reactionTimeTestMeta, snakeMeta, colourSequenceMemoryMeta, currencyConverterMeta, randomJokeMeta, publicHolidaysMeta]

export function getModulesByCategory(category: ModuleCategory) {
  return registry.filter((m) => m.category === category)
}

export function getModuleBySlug(slug: string) {
  return registry.find((m) => m.slug === slug)
}

export function sortModulesByNewest(modules: Module[]): Module[] {
  return [...modules].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
