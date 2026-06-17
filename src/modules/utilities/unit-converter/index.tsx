'use client'

import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { convert, getCategories, getUnits, UnitCategoryId } from './logic'

type CategoryKey = keyof IntlMessages['modules']['unit-converter']['categories']
type UnitKey = keyof IntlMessages['modules']['unit-converter']['units']

export default function UnitConverter() {
  const t = useTranslations('modules.unit-converter')
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

  function handleFromUnitChange(id: string) {
    if (id === toUnit) {
      setToUnit(units.find((u) => u.id !== id)?.id ?? toUnit)
    }
    setFromUnit(id)
  }

  function handleToUnitChange(id: string) {
    if (id === fromUnit) {
      setFromUnit(units.find((u) => u.id !== id)?.id ?? fromUnit)
    }
    setToUnit(id)
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

  function handleSwap() {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    if (formattedResult !== '') setInputValue(formattedResult)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex gap-1 mb-6 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            variant={activeCategory === cat.id ? 'default' : 'ghost'}
            size="sm"
            className={cn(activeCategory !== cat.id && 'bg-muted text-muted-foreground')}
          >
            {t(`categories.${cat.id}` as `categories.${CategoryKey}`)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0"
            aria-label={t('ariaValueToConvert')}
            className="flex-1 min-w-0"
          />
          <Select value={fromUnit} onValueChange={handleFromUnitChange}>
            <SelectTrigger className="w-auto" aria-label={t('ariaFromUnit')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {t(`units.${u.id}` as `units.${UnitKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="flex-1 border-t border-border" />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            aria-label={t('ariaSwapUnits')}
            className="shrink-0"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <span className="flex-1 border-t border-border" />
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            value={formattedResult}
            readOnly
            placeholder="—"
            aria-label={t('ariaConvertedResult')}
            className="flex-1 min-w-0 bg-muted text-muted-foreground"
          />
          <Select value={toUnit} onValueChange={handleToUnitChange}>
            <SelectTrigger className="w-auto" aria-label={t('ariaToUnit')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {t(`units.${u.id}` as `units.${UnitKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
