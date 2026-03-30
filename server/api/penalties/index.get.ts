import { useF1LiveTiming } from '../../utils/f1-live-state'

// GET /api/penalties - Get race control messages that are penalties/investigations
export default defineEventHandler(async () => {
  // Try live data first
  const client = useF1LiveTiming()
  const liveMessages: any[] = []

  if (client) {
    const rcm = client.getRaceControlMessages()
    if (rcm?.Messages) {
      const msgs = Object.values(rcm.Messages as Record<string, any>)
      for (const msg of msgs) {
        const text = (msg.Message || '').toUpperCase()
        if (
          text.includes('PENALTY') ||
          text.includes('INVESTIGATION') ||
          text.includes('NOTED') ||
          text.includes('WARNING') ||
          text.includes('BLACK AND WHITE') ||
          text.includes('REPRIMAND') ||
          text.includes('DELETED') ||
          text.includes('INFRINGEMENT')
        ) {
          liveMessages.push({
            source: 'live',
            utc: msg.Utc,
            message: msg.Message,
            category: msg.Category,
            flag: msg.Flag,
            lap: msg.Lap,
            driver: msg.RacingNumber,
            session: client.getSessionInfo()?.Name || 'Unknown',
            gp: client.getSessionInfo()?.Meeting?.Name || 'Unknown'
          })
        }
      }
    }
  }

  // Sort by time desc
  liveMessages.sort((a, b) => new Date(b.utc || 0).getTime() - new Date(a.utc || 0).getTime())

  return {
    live: liveMessages,
    sessionActive: !!client?.getSessionInfo()
  }
})
