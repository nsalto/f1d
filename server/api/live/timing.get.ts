import { liveTimingPayload, useF1LiveTiming } from '../../utils/f1-live-state'

export default defineEventHandler(() => {
  const client = useF1LiveTiming()

  if (!client) {
    throw createError({
      statusCode: 503,
      message: 'Live timing client not initialized',
    })
  }

  const state = client.currentState

  if (!state || Object.keys(state).length === 0) {
    throw createError({
      statusCode: 503,
      message: 'No active F1 session or no data available',
    })
  }

  return liveTimingPayload(client)
})
