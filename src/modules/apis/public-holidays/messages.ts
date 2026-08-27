export const MESSAGES = {
  countryLabel: 'Country',
  countryPlaceholder: 'Select a country',
  yearLabel: 'Year',
  loadingCountries: 'Loading countries…',
  loading: 'Loading holidays…',
  empty: 'No public holidays are listed for this country in this year.',
  nextBadge: 'Next',
  countHint: (count: number) => `${count} ${count === 1 ? 'holiday' : 'holidays'}`,
  attribution: 'Holiday data from Nager.Date',
  attributionUrl: 'https://date.nager.at',
  errors: {
    countryLoad: "Couldn't load the country list. Please reload the page.",
    notFound: 'No holiday data is available for that country and year.',
    invalidInput: 'Please choose a valid country and year.',
    upstream: 'The holiday service returned an error. Please try again.',
    network: "Couldn't reach the holiday service. Check your connection.",
  },
} as const

export const ARIA = {
  country: 'Country',
  year: 'Year',
  holidayList: 'Public holidays',
} as const

export type ErrorKey = keyof typeof MESSAGES.errors
