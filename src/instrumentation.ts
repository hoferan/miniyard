export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: Headers },
  context: { routeType: string }
) {
  const { captureRequestError } = await import('@sentry/nextjs')
  captureRequestError(
    err,
    { path: request.path, method: request.method, headers: Object.fromEntries(request.headers) },
    { routerKind: 'App Router', routePath: request.path, routeType: context.routeType }
  )
}
