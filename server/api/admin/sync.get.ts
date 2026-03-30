import { syncCalendar, syncDriverStandings, syncConstructorStandings, syncOpenF1Sessions } from '../utils/sync'
import { syncAllCompletedRaces } from '../utils/sync-races'

export default defineEventHandler(async (event) => {
  const season = String(new Date().getFullYear())

  try {
    console.log('[api/admin/sync] Starting manual sync...')

    await syncCalendar(season)
    console.log('[api/admin/sync] ✓ Calendar synced')

    await syncDriverStandings(season)
    console.log('[api/admin/sync] ✓ Driver standings synced')

    await syncConstructorStandings(season)
    console.log('[api/admin/sync] ✓ Constructor standings synced')

    try {
      await syncOpenF1Sessions(parseInt(season))
      console.log('[api/admin/sync] ✓ OpenF1 sessions synced')
    } catch (e) {
      console.log('[api/admin/sync] ⚠ OpenF1 sessions skipped:', e)
    }

    await syncAllCompletedRaces(season)
    console.log('[api/admin/sync] ✓ Race results synced')

    return { success: true, message: 'Sync completed' }
  } catch (error) {
    console.error('[api/admin/sync] Sync error:', error)
    return { success: false, error: String(error) }
  }
})
