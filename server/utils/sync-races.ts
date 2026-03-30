import { eq, and, lt } from 'drizzle-orm'
import { useDB, schema } from '../database'
import { syncRaceResults, syncQualifyingResults, syncOpenF1RaceData } from './sync'

// Sync results for all completed races that we haven't synced yet
export async function syncAllCompletedRaces(season: string) {
  const db = useDB()
  const today = new Date().toISOString().split('T')[0]

  // Get all past races
  const pastRaces = await db.select()
    .from(schema.races)
    .where(and(
      eq(schema.races.season, season),
      lt(schema.races.date, today)
    ))
    .orderBy(schema.races.round)

  let synced = 0

  for (const race of pastRaces) {
    // Check if we already have results for this race
    const existing = await db.select()
      .from(schema.raceResults)
      .where(and(
        eq(schema.raceResults.season, season),
        eq(schema.raceResults.round, race.round)
      ))
      .limit(1)

    if (existing.length > 0) continue // Already synced

    try {
      await syncRaceResults(season, race.round)
      synced++
    } catch (e) {
      // Race might not have results yet (API delay)
    }

    try {
      await syncQualifyingResults(season, race.round)
    } catch (e) {
      // Qualifying might not be available
    }

    // Try OpenF1 data too
    try {
      const sessions = await db.select().from(schema.sessions)
        .where(and(
          eq(schema.sessions.year, parseInt(season)),
          eq(schema.sessions.sessionName, 'Race')
        ))

      const matched = sessions.find(s =>
        s.countryName?.toLowerCase().includes(race.country?.toLowerCase() || '') ||
        race.country?.toLowerCase().includes(s.countryName?.toLowerCase() || '')
      )

      if (matched) {
        await syncOpenF1RaceData(matched.sessionKey)
      }
    } catch (e) {
      // OpenF1 might be unavailable during live sessions
    }

    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 2000))
  }

  if (synced > 0) {
    console.log(`[cron] Synced results for ${synced} races`)
  }
}
