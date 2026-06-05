'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { convert, getCategories, getUnits, UnitCategoryId } from './logic'

export default function UnitConverter() {
  const categories = getCategories()
  const [activeCategory, setActiveCategory] = useState<UnitCategoryId>('length')
  const units = getUnits(activeCategory)
  const [fromUnit, setFromUnit] = useState(units[0].id)
  const [toUnit, setToUnit] = useState(units[1].id)
  const [inputValue, setInputValue] = useState('')

  function handleCategoryChange(id: UnitCategoryId) {
    const newUnits = getUnits(id)
    setActiveCategory(id)
    setFromUnit(newUnits[0].id)
    setToUnit(newUnits[1].id)
    setInputValue('')
  }

  const numericInput = parseFloat(inputValue)
  const result =
    inputValue !== '' && !isNaN(numericInput)
      ? convert(numericInput, fromUnit, toUnit, activeCategory)
      : null

  const formattedResult =
    result !== null
      ? Math.abs(result) < 0.0001 && result !== 0
        ? result.toExponential(6)
        : parseFloat(result.toPrecision(10)).toString()
      : ''

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Unit Converter</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Convert between common units of measurement.
      </p>

      {/* Category tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Conversion inputs */}
      <div className="space-y-4">
        {/* From */}
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0"
            className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="flex-1 border-t border-border" />
          <span>equals</span>
          <span className="flex-1 border-t border-border" />
        </div>

        {/* To */}
        <div className="flex gap-2">
          <input
            type="number"
            value={formattedResult}
            readOnly
            placeholder="—"
            className="flex-1 min-w-0 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
