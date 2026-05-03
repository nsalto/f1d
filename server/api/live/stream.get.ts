import { useDB } from '../../database'
import { sql as drizzleSql } from 'drizzle-orm'

// GET /api/live/stream — SSE que polea la tabla live_state cada 1s y emite snapshots
// solo cuando hay cambios (detectado por updated_at + feed_count). El worker standalone
// escribe la tabla; este endpoint la sirve a los clientes.
//
// Por qué polling en vez de Postgres LISTEN/NOTIFY: simpler. Polling cada 1s con índice
// implícito en PK es prácticamente gratis (single-row read) y evita coordinar conexiones
// dedicadas para LISTEN. Podemos migrar a NOTIFY si más adelante hace falta latencia <1s.
const POLL_INTERVAL_MS = 1000
const HEARTBEAT_MS = 25_000

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  })

  const db = useDB()

  async function readState() {
    const rows = await db.execute(drizzleSql`
      SELECT payload, session_status, session_path, updated_at, feed_count
      FROM live_state WHERE id = 1
    `)
    return (rows as unknown as Array<{
      payload: Record<string, unknown>
      session_status: string | null
      session_path: string | null
      updated_at: Date | string
      feed_count: number
    }>)[0]
  }

  function buildPayload(row: Awaited<ReturnType<typeof readState>>) {
    const s = (row?.payload || {}) as Record<string, unknown>
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
      championshipPrediction: s.ChampionshipPrediction
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let closed = false
      let lastFeedCount = -1
      let lastUpdatedMs = -1

      const send = (payload: unknown) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        } catch {
          closed = true
        }
      }

      // Snapshot inicial
      try {
        const row = await readState()
        if (row && row.payload && Object.keys(row.payload).length > 0 && row.session_status !== 'initialized') {
          send({ type: 'snapshot', data: buildPayload(row) })
          const upd = typeof row.updated_at === 'string' ? new Date(row.updated_at).getTime() : row.updated_at.getTime()
          lastFeedCount = row.feed_count
          lastUpdatedMs = upd
        } else {
          send({ type: 'no-session' })
        }
      } catch (e) {
        send({ type: 'error', message: (e as Error).message })
      }

      // Loop de polling — solo emite si feed_count o updated_at cambió
      const poll = setInterval(async () => {
        if (closed) return
        try {
          const row = await readState()
          if (!row) return
          const upd = typeof row.updated_at === 'string' ? new Date(row.updated_at).getTime() : row.updated_at.getTime()
          if (row.feed_count === lastFeedCount && upd === lastUpdatedMs) return // sin cambios
          lastFeedCount = row.feed_count
          lastUpdatedMs = upd
          if (row.session_status === 'initialized' || !row.payload || Object.keys(row.payload).length === 0) {
            send({ type: 'no-session' })
            return
          }
          send({ type: 'update', data: buildPayload(row) })
        } catch (e) {
          send({ type: 'error', message: (e as Error).message })
        }
      }, POLL_INTERVAL_MS)

      // Heartbeat (comentario SSE) para mantener vivo el TCP a través de proxies
      const hb = setInterval(() => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`))
        } catch {
          closed = true
        }
      }, HEARTBEAT_MS)

      const cleanup = () => {
        if (closed) return
        closed = true
        clearInterval(poll)
        clearInterval(hb)
        try {
          controller.close()
        } catch {
          // already closed
        }
      }

      event.node.req.on('close', cleanup)
      event.node.req.on('error', cleanup)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform'
    }
  })
})
