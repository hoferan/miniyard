import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import {
  isValidCountryCode,
  isValidYear,
  parseCountries,
  parseHolidays,
} from '@/modules/apis/public-holidays/logic'

const NAGER_API = 'https://date.nager.at/api/v3'
/** Holiday data for a whole year changes rarely — a day of caching is plenty. */
const ONE_DAY = 86400

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  try {
    if (searchParams.get('op') === 'countries') {
      const upstream = await fetch(`${NAGER_API}/AvailableCountries`, {
        next: { revalidate: ONE_DAY },
      })
      if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })
      return NextResponse.json(parseCountries(await upstream.json()))
    }

    const country = searchParams.get('country')
    const year = Number(searchParams.get('year'))

    // Validated even though the UI can only send valid values — this is a
    // public endpoint, and the country code goes straight into the upstream path.
    if (!isValidCountryCode(country) || !isValidYear(year, new Date().getUTCFullYear())) {
      return NextResponse.json({ error: 'invalidInput' }, { status: 400 })
    }

    const upstream = await fetch(`${NAGER_API}/PublicHolidays/${year}/${country}`, {
      next: { revalidate: ONE_DAY },
    })

    // Nager answers an unsupported country or year with a 404.
    if (upstream.status === 404) {
      return NextResponse.json({ error: 'notFound' }, { status: 404 })
    }
    if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })

    return NextResponse.json(parseHolidays(await upstream.json()))
  } catch (error) {
    // An unparseable payload is an upstream problem, not something to page on.
    if ((error as Error).message === 'upstream') {
      return NextResponse.json({ error: 'upstream' }, { status: 502 })
    }
    Sentry.captureException(error)
    return NextResponse.json({ error: 'network' }, { status: 502 })
  }
}
