import { syncRaceResults, syncQualifyingResults, syncOpenF1RaceData } from '../../utils/sync'
import { useDB, schema } from '../../database'
import { eq, and } from 'drizzle-orm'

// POST /api/sync/race?season=2026&round=1 - Sync specific race data (protected)
export default defineEventHandler(async (event) => {
  requireSyncAuth(event)
  const query = getQuery(event)
  const season = String(query.season || String(new Date().getFullYear()))
  const round = Number(query.round)

  if (!round) {
    throw createError({ statusCode: 400, message: 'round is required' })
  }

  const results: string[] = []

  try {
    await syncRaceResults(season, round)
    results.push(`Race results R${round} synced`)
  } catch (e: any) {
    results.push(`Race results error: ${e.message}`)
  }

  try {
    await syncQualifyingResults(season, round)
    results.push(`Qualifying R${round} synced`)
  } catch (e: any) {
    results.push(`Qualifying error: ${e.message}`)
  }

  // Try to find matching OpenF1 session and sync detailed data
  try {
    const db = useDB()
    const race = await db.select().from(schema.races)
      .where(and(eq(schema.races.season, season), eq(schema.races.round, round)))
      .limit(1)

    if (race.length > 0) {
      const sessions = await db.select().from(schema.sessions)
        .where(and(
          eq(schema.sessions.year, parseInt(season)),
          eq(schema.sessions.sessionName, 'Race')
        ))

      // Match by country name
      const matchedSession = sessions.find(s =>
        s.countryName?.toLowerCase().includes(race[0].country?.toLowerCase() || '') ||
        race[0].country?.toLowerCase().includes(s.countryName?.toLowerCase() || '')
      )

      if (matchedSession) {
        await syncOpenF1RaceData(matchedSession.sessionKey)
        results.push(`OpenF1 data for session ${matchedSession.sessionKey} synced`)
      }
    }
  } catch (e: any) {
    results.push(`OpenF1 data error: ${e.message}`)
  }

  return { ok: true, results }
})
