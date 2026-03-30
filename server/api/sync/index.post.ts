import { syncCalendar, syncDriverStandings, syncConstructorStandings, syncOpenF1Sessions } from '../../utils/sync'

// POST /api/sync - Trigger initial data sync (protected)
export default defineEventHandler(async (event) => {
  requireSyncAuth(event)
  const season = String(new Date().getFullYear())
  const results: string[] = []

  try {
    await syncCalendar(season)
    results.push(`Calendar ${season} synced`)
  } catch (e: any) {
    results.push(`Calendar error: ${e.message}`)
  }

  try {
    await syncDriverStandings(season)
    results.push('Driver standings synced')
  } catch (e: any) {
    results.push(`Driver standings error: ${e.message}`)
  }

  try {
    await syncConstructorStandings(season)
    results.push('Constructor standings synced')
  } catch (e: any) {
    results.push(`Constructor standings error: ${e.message}`)
  }

  try {
    await syncOpenF1Sessions(parseInt(season))
    results.push('OpenF1 sessions synced')
  } catch (e: any) {
    results.push(`OpenF1 sessions error: ${e.message}`)
  }

  return { ok: true, season, results }
})
