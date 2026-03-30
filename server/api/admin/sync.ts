import { syncCalendar, syncDriverStandings, syncConstructorStandings, syncOpenF1Sessions } from '~/server/utils/sync'
import { syncAllCompletedRaces } from '~/server/utils/sync-races'

export default defineEventHandler(async (event) => {
  const season = String(new Date().getFullYear())

  try {
    console.log('[api] Starting manual sync...')

    await syncCalendar(season)
    console.log('[api] ✓ Calendar synced')

    await syncDriverStandings(season)
    console.log('[api] ✓ Driver standings synced')

    await syncConstructorStandings(season)
    console.log('[api] ✓ Constructor standings synced')

    try {
      await syncOpenF1Sessions(parseInt(season))
      console.log('[api] ✓ OpenF1 sessions synced')
    } catch (e) {
      console.log('[api] ⚠ OpenF1 sessions skipped:', e)
    }

    await syncAllCompletedRaces(season)
    console.log('[api] ✓ Race results synced')

    return { success: true, message: 'Sync completed' }
  } catch (error) {
    console.error('[api] Sync error:', error)
    return { success: false, error: String(error) }
  }
})
