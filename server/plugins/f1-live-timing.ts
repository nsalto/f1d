import { F1LiveTimingClient, FREE_TOPICS } from '../utils/f1-signalr'
import { setF1LiveClient } from '../utils/f1-live-state'
import { syncAllCompletedRaces } from '../utils/sync-races'

// Reconnect strategy: empezamos en 30s, duplicamos hasta un techo de 5 min,
// con jitter ±20% para evitar thundering herd. El servidor F1 SignalR está
// pensado para conexiones largas — reconectar más rápido no es spam, es
// retomar el canal que se cayó.
const RECONNECT_MIN_MS = 30 * 1000
const RECONNECT_MAX_MS = 5 * 60 * 1000

function withJitter(ms: number) {
  const jitter = ms * 0.2 * (Math.random() * 2 - 1) // ±20%
  return Math.max(1000, Math.round(ms + jitter))
}

export default defineNitroPlugin(async (nitro) => {
  if (import.meta.prerender) return

  // Dedupe por sesión: una vez que disparamos el sync para una sesión "Finalised",
  // no lo volvemos a disparar aunque el feed siga repitiendo el status.
  const syncedSessions = new Set<string>()

  const client = new F1LiveTimingClient({
    topics: FREE_TOPICS,
    accessToken: null,

    onInitialState: (state) => {
      const sessionInfo = state.SessionInfo
      if (sessionInfo?.Meeting?.Name) {
        console.log(
          `[F1 Live] Session: ${sessionInfo.Meeting.Name} - ${sessionInfo.Name}`
        )
      }
    },

    onFeed: (topic, _data, _timestamp) => {
      // Silence heartbeat noise
      if (topic === 'Heartbeat') return
    },

    onClose: (_error) => {
      // Will try to reconnect via the retry loop with exponential backoff
    }
  })

  setF1LiveClient(client)

  // Trigger post-sesión: cuando la FIA marca la sesión como 'Finalised' (o 'Ends'),
  // los resultados oficiales ya están listos. Disparamos una sync inmediata de
  // resultados para que la app muestre datos frescos en minutos en lugar de esperar
  // el cron de 30 min.
  client.on('session', (...args: unknown[]) => {
    const status = args[0] as string
    const isFinal = status === 'Finalised' || status === 'Ends'
    if (!isFinal) return

    // Generamos una key única de la sesión actual para deduplicar
    const info = client.getSessionInfo()
    const sessionKey = info?.Path
      || `${info?.Meeting?.Name || 'unknown'}/${info?.Name || ''}`

    if (syncedSessions.has(sessionKey)) return
    syncedSessions.add(sessionKey)

    const season = String(new Date().getFullYear())
    console.log(`[F1 Live] Session ${sessionKey} marked ${status} — triggering race results sync`)

    // No await: dejamos que corra en background, así no bloqueamos al SignalR client
    syncAllCompletedRaces(season).catch((err) => {
      console.error('[F1 Live] post-session sync failed:', err)
      // Si falló, sacamos la marca para que pueda reintentar la próxima vez que llegue Finalised
      syncedSessions.delete(sessionKey)
    })
  })

  // Try to connect, but don't block server startup
  // If no session is active, it just won't connect - that's fine
  let backoffMs = RECONNECT_MIN_MS
  let connected = false

  async function tryConnect() {
    try {
      await client.start()
      console.log('[F1 Live] Connected to live timing')
      connected = true
      backoffMs = RECONNECT_MIN_MS // reset backoff al conectar
    } catch (err) {
      connected = false
      const e = err as Error & { errorType?: string, statusCode?: number }
      console.warn(
        `[F1 Live] Connection attempt failed: ${e?.message || e}`
        + (e?.errorType ? ` | errorType=${e.errorType}` : '')
        + (e?.statusCode ? ` | status=${e.statusCode}` : '')
      )
      // Stack trace recortado — para saber DÓNDE adentro de SignalR explota el require
      if (e?.stack) {
        const lines = e.stack.split('\n').slice(0, 10).join('\n')
        console.warn(`[F1 Live] stack:\n${lines}`)
      }
    }
  }

  // Cuando el cliente se desconecta, marcamos para que el retry loop reconecte
  client.on('disconnected', () => {
    connected = false
  })
  client.on('connected', () => {
    connected = true
    backoffMs = RECONNECT_MIN_MS
  })

  // Initial attempt (non-blocking)
  tryConnect()

  // Retry loop con exponential backoff + jitter
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let stopped = false

  function scheduleRetry() {
    if (stopped) return
    const delay = withJitter(backoffMs)
    retryTimer = setTimeout(async () => {
      if (stopped) return
      const state = client.currentState
      const isStateEmpty = !state || Object.keys(state).length === 0
      if (!connected || isStateEmpty) {
        await tryConnect()
        // Si seguimos sin conectar, duplicamos el backoff hasta el máximo
        if (!connected) {
          backoffMs = Math.min(backoffMs * 2, RECONNECT_MAX_MS)
        }
      }
      scheduleRetry()
    }, delay)
  }
  scheduleRetry()

  nitro.hooks.hook('close', async () => {
    stopped = true
    if (retryTimer) clearTimeout(retryTimer)
    await client.stop()
  })
})
