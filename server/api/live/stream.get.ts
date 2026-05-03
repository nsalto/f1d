import { liveTimingPayload, useF1LiveTiming } from '../../utils/f1-live-state'

// GET /api/live/stream — SSE endpoint para updates en tiempo real
//
// Modelo: PUSH (no polling). El cliente SignalR emite eventos 'state' cuando llega
// un feed; los coalescemos en una ventana de 200ms para no spamear al cliente
// cuando llegan ráfagas de updates. Latencia típica: <250ms vs los 2000ms del
// polling anterior.
const COALESCE_MS = 200
const HEARTBEAT_MS = 25_000 // ping para mantener vivo el conn a través de proxies

export default defineEventHandler(async (event) => {
  const client = useF1LiveTiming()

  if (!client) {
    throw createError({ statusCode: 503, message: 'Live timing not available' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    // Disable buffering on nginx if alguna vez se usa
    'X-Accel-Buffering': 'no'
  })

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let closed = false

      const send = (payload: unknown) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        } catch {
          closed = true
        }
      }

      // 1) Snapshot inicial
      const initial = client.currentState
      if (initial && Object.keys(initial).length > 0) {
        send({ type: 'snapshot', data: liveTimingPayload(client) })
      } else {
        send({ type: 'no-session' })
      }

      // 2) Push updates con coalescing — agrupar ráfagas de feeds en un solo send
      let pending: ReturnType<typeof setTimeout> | null = null
      const flush = () => {
        pending = null
        const state = client.currentState
        if (state && Object.keys(state).length > 0) {
          send({ type: 'update', data: liveTimingPayload(client) })
        }
      }
      const offState = client.on('state', () => {
        if (pending) return // ya hay un flush programado en la ventana
        pending = setTimeout(flush, COALESCE_MS)
      })

      // 3) Heartbeat — mantener el TCP vivo y dar señal de vida al cliente
      const hb = setInterval(() => {
        if (closed) return
        try {
          // Comentario SSE — no genera evento en el EventSource pero mantiene el stream
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`))
        } catch {
          closed = true
        }
      }, HEARTBEAT_MS)

      // 4) Disconnect/connect events del SignalR
      const offDisc = client.on('disconnected', () => send({ type: 'disconnected' }))
      const offConn = client.on('connected', () => send({ type: 'connected' }))

      // 5) Cleanup
      const cleanup = () => {
        if (closed) return
        closed = true
        if (pending) clearTimeout(pending)
        clearInterval(hb)
        offState()
        offDisc()
        offConn()
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
