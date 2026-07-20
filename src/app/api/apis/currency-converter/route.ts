import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { parseCurrencies, parseRate } from '@/modules/apis/currency-converter/logic'

const FRANKFURTER = 'https://api.frankfurter.dev/v2'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const op = searchParams.get('op')

  try {
    if (op === 'currencies') {
      const upstream = await fetch(`${FRANKFURTER}/currencies`, { next: { revalidate: 86400 } })
      if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })
      const data = await upstream.json()
      return NextResponse.json(parseCurrencies(data))
    }

    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (!from || !to) return NextResponse.json({ error: 'invalid_currency' }, { status: 400 })

    const url = `${FRANKFURTER}/rates?base=${encodeURIComponent(from)}&quotes=${encodeURIComponent(to)}`
    const upstream = await fetch(url, { next: { revalidate: 3600 } })
    if (upstream.status === 404 || upstream.status === 422) {
      return NextResponse.json({ error: 'invalid_currency' }, { status: 400 })
    }
    if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })
    const data = await upstream.json()
    return NextResponse.json(parseRate(data))
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'network' }, { status: 502 })
  }
}
