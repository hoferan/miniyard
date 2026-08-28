/** Rendered whenever a result cannot be computed. */
export const PLACEHOLDER = '—'

export const DIRECTION_WORDS = {
  increase: 'increase',
  decrease: 'decrease',
  none: 'no change',
} as const

export const MESSAGES = {
  percentOfTitle: 'What is X% of Y?',
  percentOfPercentageLabel: 'Percentage',
  percentOfValueLabel: 'Of value',
  percentOfResultLabel: 'Result',

  whatPercentTitle: 'X is what % of Y?',
  whatPercentValueLabel: 'Value',
  whatPercentBaseLabel: 'Base',
  whatPercentResultLabel: 'Result',

  changeTitle: 'Percentage change from X to Y',
  changeOldLabel: 'Old value',
  changeNewLabel: 'New value',
  changeResultLabel: 'Result',
}

export const ARIA = {
  percentOfPercentage: 'Percentage for percent of value',
  percentOfValue: 'Value for percent of value',
  percentOfResult: 'Percent of value result',

  whatPercentValue: 'Value for what percent of base',
  whatPercentBase: 'Base for what percent of base',
  whatPercentResult: 'What percent of base result',

  changeOld: 'Old value for percentage change',
  changeNew: 'New value for percentage change',
  changeResult: 'Percentage change result',
}
