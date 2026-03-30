import { syncCalendar, syncDriverStandings, syncConstructorStandings, syncOpenF1Sessions } from '../utils/sync'
import { syncAllCompletedRaces } from '../utils/sync-races'

export default defineNitroPlugin(async () => {
  const season = String(new Date().getFullYear())

  // Wait for migrations to complete with retries
  let db: any = null
  let schema: any = null
  let ready = false

  for (let i = 0; i < 30; i++) {
    try {
      const { useDB, schema: dbSchema } = await import('../database')
      db = useDB()
      schema = dbSchema
      await db.select().from(schema.races).limit(1)
      ready = true
      break
    } catch {
      if (i < 29) {
        await new Promise(r => setTimeout(r, 500))
      }
    }
  }

  if (!ready) {
    console.error('[scheduler] Database not ready after retries')
    return
  }

  // Initial sync on server start if DB is empty
  try {
    const raceCount = await db.select().from(schema.races).limit(1)

    if (raceCount.length === 0) {
      console.log('[scheduler] DB empty, running initial sync...')
      await syncCalendar(season)
      await syncDriverStandings(season)
      await syncConstructorStandings(season)
      try {
        await syncOpenF1Sessions(parseInt(season))
      } catch (e) {
        console.log('[scheduler] OpenF1 sessions sync skipped (may be live)')
      }
      console.log('[scheduler] Initial sync complete')
    }
  } catch (e) {
    console.error('[scheduler] Initial sync failed:', e)
  }

  // Schedule periodic syncs
  // Standings: every 2 hours
  scheduleInterval(async () => {
    console.log('[cron] Syncing standings...')
    try {
      await syncDriverStandings(season)
      await syncConstructorStandings(season)
      console.log('[cron] Standings synced')
    } catch (e) {
      console.error('[cron] Standings sync error:', e)
    }
  }, 2 * 60 * 60 * 1000) // 2 hours

  // Calendar: once a day
  scheduleInterval(async () => {
    console.log('[cron] Syncing calendar...')
    try {
      await syncCalendar(season)
      console.log('[cron] Calendar synced')
    } catch (e) {
      console.error('[cron] Calendar sync error:', e)
    }
  }, 24 * 60 * 60 * 1000) // 24 hours

  // Race results: every 30 min (catches post-race updates)
  scheduleInterval(async () => {
    try {
      await syncAllCompletedRaces(season)
    } catch (e) {
      console.error('[cron] Race results sync error:', e)
    }
  }, 30 * 60 * 1000) // 30 minutes

  // OpenF1 sessions: every 6 hours
  scheduleInterval(async () => {
    try {
      await syncOpenF1Sessions(parseInt(season))
    } catch (e) {
      // Expected to fail during live sessions
    }
  }, 6 * 60 * 60 * 1000) // 6 hours

  console.log('[scheduler] Sync schedules configured')
})

function scheduleInterval(fn: () => Promise<void>, ms: number) {
  setInterval(() => {
    fn().catch(() => {})
  }, ms)
}
