import { useDB, schema } from '../../database'
import { sql } from 'drizzle-orm'

// GET /api/admin/debug - Debug endpoint to check database state
export default defineEventHandler(async () => {
  const db = useDB()

  try {
    // Count races
    const raceCount = await db.select().from(schema.races)

    // Count race results
    const resultCount = await db.select().from(schema.raceResults)

    // Count driver standings
    const driverStandingsCount = await db.select().from(schema.driverStandings)

    // Get last sync log
    const lastSyncs = await db.select()
      .from(schema.syncLog)
      .orderBy(sql`synced_at DESC`)
      .limit(10)

    // Get race info
    const races = await db.select()
      .from(schema.races)
      .orderBy(sql`date DESC`)
      .limit(5)

    // Get last race results
    const lastRaceResults = await db.select()
      .from(schema.raceResults)
      .orderBy(sql`id DESC`)
      .limit(3)

    return {
      status: 'ok',
      database: {
        races: {
          total: raceCount.length,
          recent: races.map(r => ({
            round: r.round,
            name: r.raceName,
            date: r.date,
            country: r.country
          }))
        },
        raceResults: {
          total: resultCount.length,
          samples: lastRaceResults.map(r => ({
            round: r.round,
            position: r.position,
            driverId: r.driverId,
            constructorName: r.constructorName
          }))
        },
        driverStandings: {
          total: driverStandingsCount.length
        }
      },
      syncLog: {
        recent: lastSyncs.map(s => ({
          entity: s.entity,
          key: s.key,
          syncedAt: s.syncedAt
        }))
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[admin/debug]', error)
    return {
      status: 'error',
      error: (error as any).message,
      timestamp: new Date().toISOString()
    }
  }
})
