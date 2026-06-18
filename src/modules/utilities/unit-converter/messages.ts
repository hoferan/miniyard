import type { UnitCategoryId } from './logic'

export const CATEGORY_LABELS: Record<UnitCategoryId, string> = {
  length: 'Length',
  weight: 'Weight',
  temperature: 'Temperature',
  volume: 'Volume',
}

export const UNIT_LABELS: Record<string, string> = {
  m: 'Meter (m)',
  km: 'Kilometer (km)',
  cm: 'Centimeter (cm)',
  mi: 'Mile (mi)',
  ft: 'Foot (ft)',
  in: 'Inch (in)',
  g: 'Gram (g)',
  kg: 'Kilogram (kg)',
  lb: 'Pound (lb)',
  oz: 'Ounce (oz)',
  c: 'Celsius (°C)',
  f: 'Fahrenheit (°F)',
  k: 'Kelvin (K)',
  ml: 'Milliliter (ml)',
  l: 'Liter (l)',
  cup: 'Cup',
  fl_oz: 'Fl. Ounce (fl oz)',
}
