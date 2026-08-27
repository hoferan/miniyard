export const MESSAGES = {
  categoryLabel: 'Category',
  safeModeLabel: 'Safe mode',
  safeModeHint: 'Filters out jokes flagged as offensive.',
  fetchButton: 'Another joke',
  firstFetchButton: 'Tell me a joke',
  loading: 'Fetching…',
  revealButton: 'Show punchline',
  attribution: 'Jokes from JokeAPI',
  attributionUrl: 'https://jokeapi.dev',
  errors: {
    noMatch: 'No joke matched those filters. Try another category or turn safe mode off.',
    rateLimited: 'Too many requests. Give it a minute and try again.',
    upstream: 'The joke service returned an error. Please try again.',
    network: "Couldn't reach the joke service. Check your connection.",
    invalid_category: "That category isn't supported.",
  },
} as const

export const ARIA = {
  category: 'Joke category',
  safeMode: 'Safe mode',
  fetch: 'Fetch another joke',
  reveal: 'Show the punchline',
  joke: 'Joke',
} as const

export type ErrorKey = keyof typeof MESSAGES.errors
