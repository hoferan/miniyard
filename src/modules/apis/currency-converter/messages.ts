export const MESSAGES = {
  amountLabel: 'Amount',
  amountPlaceholder: '0.00',
  fromLabel: 'From',
  toLabel: 'To',
  convertButton: 'Convert',
  loadingCurrencies: 'Loading currencies…',
  converting: 'Converting…',
  attribution: 'Exchange rates from Frankfurter (European Central Bank)',
  attributionUrl: 'https://frankfurter.dev',
  unitRate: (from: string, rate: string, to: string) => `1 ${from} = ${rate} ${to}`,
  asOf: (date: string) => `Rates as of ${date}`,
  errors: {
    empty: 'Enter an amount.',
    notNumber: 'Enter a valid number.',
    negative: "Amount can't be negative.",
    invalid_currency: "One of the selected currencies isn't supported.",
    upstream: 'The exchange-rate service returned an error. Please try again.',
    network: "Couldn't reach the exchange-rate service. Check your connection.",
    currencyLoad: "Couldn't load the currency list. Please refresh.",
  },
} as const

export const ARIA = {
  amount: 'Amount to convert',
  from: 'Convert from currency',
  to: 'Convert to currency',
  swap: 'Swap currencies',
} as const

export type ErrorKey = keyof typeof MESSAGES.errors
