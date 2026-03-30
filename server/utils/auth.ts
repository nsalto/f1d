import type { H3Event } from 'h3'

export function requireSyncAuth(event: H3Event) {
  const config = useRuntimeConfig()
  const secret = config.syncSecret

  if (!secret) {
    throw createError({ statusCode: 500, message: 'SYNC_SECRET not configured' })
  }

  // Check header or query param
  const headerKey = getHeader(event, 'x-sync-secret')
  const queryKey = getQuery(event).secret as string | undefined

  if (headerKey !== secret && queryKey !== secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
}
