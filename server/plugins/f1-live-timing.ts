import { F1LiveTimingClient, FREE_TOPICS } from '../utils/f1-signalr'
import { setF1LiveClient } from '../utils/f1-live-state'

export default defineNitroPlugin(async (nitro) => {
  if (import.meta.prerender) return

  const client = new F1LiveTimingClient({
    topics: FREE_TOPICS,
    accessToken: null,

    onInitialState: (state) => {
      const sessionInfo = state.SessionInfo
      if (sessionInfo?.Meeting?.Name) {
        console.log(
          `[F1 Live] Session: ${sessionInfo.Meeting.Name} - ${sessionInfo.Name}`,
        )
      }
    },

    onFeed: (topic, _data, _timestamp) => {
      // Silence heartbeat noise
      if (topic === 'Heartbeat') return
    },

    onClose: (_error) => {
      // Will try to reconnect periodically via the retry loop
    },
  })

  setF1LiveClient(client)

  // Try to connect, but don't block server startup
  // If no session is active, it just won't connect - that's fine
  async function tryConnect() {
    try {
      await client.start()
      console.log('[F1 Live] Connected to live timing')
    } catch {
      // Normal when no F1 session is active
    }
  }

  // Initial attempt (non-blocking)
  tryConnect()

  // Retry every 5 minutes if not connected
  const retryInterval = setInterval(async () => {
    const state = client.currentState
    if (!state || Object.keys(state).length === 0) {
      await tryConnect()
    }
  }, 5 * 60 * 1000)

  nitro.hooks.hook('close', async () => {
    clearInterval(retryInterval)
    await client.stop()
  })
})
