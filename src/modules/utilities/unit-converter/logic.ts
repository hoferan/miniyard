import { CATEGORY_LABELS, UNIT_LABELS } from './messages'

export type UnitCategoryId = 'length' | 'weight' | 'temperature' | 'volume'

export type UnitDefinition = {
  id: string
  label: string
  /** Conversion factor to the base unit (not used for temperature) */
  factor?: number
}

export type CategoryDefinition = {
  id: UnitCategoryId
  label: string
}

const CATEGORIES: CategoryDefinition[] = [
  { id: 'length', label: CATEGORY_LABELS.length },
  { id: 'weight', label: CATEGORY_LABELS.weight },
  { id: 'temperature', label: CATEGORY_LABELS.temperature },
  { id: 'volume', label: CATEGORY_LABELS.volume },
]

/** Base unit: meter */
const LENGTH_UNITS: UnitDefinition[] = [
  { id: 'm', label: UNIT_LABELS.m, factor: 1 },
  { id: 'km', label: UNIT_LABELS.km, factor: 1000 },
  { id: 'cm', label: UNIT_LABELS.cm, factor: 0.01 },
  { id: 'mi', label: UNIT_LABELS.mi, factor: 1609.344 },
  { id: 'ft', label: UNIT_LABELS.ft, factor: 0.3048 },
  { id: 'in', label: UNIT_LABELS.in, factor: 0.0254 },
]

/** Base unit: gram */
const WEIGHT_UNITS: UnitDefinition[] = [
  { id: 'g', label: UNIT_LABELS.g, factor: 1 },
  { id: 'kg', label: UNIT_LABELS.kg, factor: 1000 },
  { id: 'lb', label: UNIT_LABELS.lb, factor: 453.59237 },
  { id: 'oz', label: UNIT_LABELS.oz, factor: 28.349523125 },
]

const TEMPERATURE_UNITS: UnitDefinition[] = [
  { id: 'c', label: UNIT_LABELS.c },
  { id: 'f', label: UNIT_LABELS.f },
  { id: 'k', label: UNIT_LABELS.k },
]

/** Base unit: milliliter */
const VOLUME_UNITS: UnitDefinition[] = [
  { id: 'ml', label: UNIT_LABELS.ml, factor: 1 },
  { id: 'l', label: UNIT_LABELS.l, factor: 1000 },
  { id: 'cup', label: UNIT_LABELS.cup, factor: 236.5882365 },
  { id: 'fl_oz', label: UNIT_LABELS.fl_oz, factor: 29.5735295625 },
]

const UNITS_MAP: Record<UnitCategoryId, UnitDefinition[]> = {
  length: LENGTH_UNITS,
  weight: WEIGHT_UNITS,
  temperature: TEMPERATURE_UNITS,
  volume: VOLUME_UNITS,
}

export function getCategories(): CategoryDefinition[] {
  return CATEGORIES
}

export function getUnits(category: UnitCategoryId): UnitDefinition[] {
  return UNITS_MAP[category]
}

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value

  // Convert to Celsius first
  let celsius: number
  if (from === 'c') celsius = value
  else if (from === 'f') celsius = (value - 32) * (5 / 9)
  else celsius = value - 273.15 // from k

  if (to === 'c') return celsius
  if (to === 'f') return celsius * (9 / 5) + 32
  return celsius + 273.15 // to k
}

export function convert(value: number, from: string, to: string, category: UnitCategoryId): number {
  if (from === to) return value

  if (category === 'temperature') {
    return convertTemperature(value, from, to)
  }

  const units = getUnits(category)
  const fromUnit = units.find((u) => u.id === from)
  const toUnit = units.find((u) => u.id === to)

  if (!fromUnit?.factor || !toUnit?.factor) {
    throw new Error(`Unknown unit: ${from} or ${to} in category ${category}`)
  }

  return (value * fromUnit.factor) / toUnit.factor
}
