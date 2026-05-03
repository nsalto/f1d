import { useDB } from '../../database'
import { sql as drizzleSql } from 'drizzle-orm'

// GET /api/live/timing — devuelve el snapshot live escrito por el worker standalone.
// El worker (scripts/live-worker.mjs) corre fuera del bundle de Nitro porque
// @microsoft/signalr usa require() dinámicos que no funcionan acá. Escribe el state
// en la tabla `live_state` (single-row, id=1).
export default defineEventHandler(async () => {
  const db = useDB()

  // Single-row, id=1. Si no existe el worker no corrió todavía.
  const rows = await db.execute(drizzleSql`
    SELECT payload, session_status, session_path, updated_at, last_feed_topic, feed_count
    FROM live_state WHERE id = 1
  `)

  const row = (rows as unknown as Array<{
    payload: Record<string, unknown>
    session_status: string | null
    session_path: string | null
    updated_at: Date | string
    last_feed_topic: string | null
    feed_count: number
  }>)[0]

  if (!row) {
    throw createError({
      statusCode: 503,
      message: 'Live state row not found — start the worker (node scripts/live-worker.mjs)'
    })
  }

  const state = row.payload || {}
  const hasState = Object.keys(state).length > 0

  if (!hasState || row.session_status === 'initialized') {
    throw createError({
      statusCode: 503,
      message: 'No active F1 session or worker not connected yet'
    })
  }

  // Calculamos cuán vieja es la data — útil para que el cliente sepa si el worker está vivo
  const updatedAt = typeof row.updated_at === 'string' ? new Date(row.updated_at) : row.updated_at
  const ageMs = Date.now() - updatedAt.getTime()

  // Devolvemos el shape histórico (igual que el cliente in-memory) para no romper el frontend
  const s = state as {
    SessionInfo?: unknown
    TrackStatus?: unknown
    WeatherData?: unknown
    LapCount?: unknown
    TimingData?: unknown
    RaceControlMessages?: unknown
    DriverList?: unknown
    ExtrapolatedClock?: unknown
    SessionStatus?: unknown
    SessionData?: unknown
    TimingStats?: unknown
    TimingAppData?: unknown
    ChampionshipPrediction?: unknown
  }

  return {
    sessionInfo: s.SessionInfo,
    trackStatus: s.TrackStatus,
    weatherData: s.WeatherData,
    lapCount: s.LapCount,
    timingData: s.TimingData,
    raceControlMessages: s.RaceControlMessages,
    driverList: s.DriverList,
    extrapolatedClock: s.ExtrapolatedClock,
    sessionStatus: s.SessionStatus,
    sessionData: s.SessionData,
    timingStats: s.TimingStats,
    timingAppData: s.TimingAppData,
    championshipPrediction: s.ChampionshipPrediction,
    _meta: {
      ageMs,
      updatedAt,
      sessionPath: row.session_path,
      lastFeedTopic: row.last_feed_topic,
      feedCount: row.feed_count
    }
  }
})
