import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { buildUpstreamPath, isValidCategory, parseJoke } from '@/modules/apis/random-joke/logic'

const JOKE_API = 'https://v2.jokeapi.dev'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'Any'
  const safeMode = searchParams.get('safeMode') !== 'false'

  if (!isValidCategory(category)) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 })
  }

  try {
    // Never cached: a cached response would serve the same "random" joke every time.
    const upstream = await fetch(`${JOKE_API}${buildUpstreamPath(category, safeMode)}`, {
      cache: 'no-store',
    })

    if (upstream.status === 429) {
      return NextResponse.json({ error: 'rateLimited' }, { status: 429 })
    }
    if (!upstream.ok) {
      return NextResponse.json({ error: 'upstream' }, { status: 502 })
    }

    // JokeAPI reports failures with HTTP 200 and error:true, so the body decides.
    const data = await upstream.json()
    return NextResponse.json(parseJoke(data))
  } catch (error) {
    const key = (error as Error).message
    if (key === 'noMatch') return NextResponse.json({ error: 'noMatch' }, { status: 404 })
    if (key === 'upstream') return NextResponse.json({ error: 'upstream' }, { status: 502 })
    Sentry.captureException(error)
    return NextResponse.json({ error: 'network' }, { status: 502 })
  }
}
