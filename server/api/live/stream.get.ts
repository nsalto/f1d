import { liveTimingPayload, useF1LiveTiming } from '../../utils/f1-live-state'

// GET /api/live/stream - SSE endpoint for real-time updates
export default defineEventHandler(async (event) => {
  const client = useF1LiveTiming()

  if (!client) {
    throw createError({ statusCode: 503, message: 'Live timing not available' })
  }

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial state immediately
      const state = client.currentState
      if (state && Object.keys(state).length > 0) {
        const data = JSON.stringify({
          type: 'snapshot',
          data: liveTimingPayload(client)
        })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      } else {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'no-session' })}\n\n`))
      }

      // Poll for updates every 2 seconds
      const interval = setInterval(() => {
        try {
          const currentState = client.currentState
          if (currentState && Object.keys(currentState).length > 0) {
            const data = JSON.stringify({
              type: 'update',
              data: liveTimingPayload(client)
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        } catch {
          clearInterval(interval)
          controller.close()
        }
      }, 2000)

      // Cleanup on close
      event.node.req.on('close', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  })
})
