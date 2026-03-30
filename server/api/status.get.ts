import { useDB, schema } from '../database'
import { eq } from 'drizzle-orm'

// GET /api/status - Public endpoint showing data freshness
export default defineEventHandler(async () => {
  const db = useDB()
  const season = String(new Date().getFullYear())

  const [races, drivers, constructors, syncLogs] = await Promise.all([
    db.select().from(schema.races).where(eq(schema.races.season, season)),
    db.select().from(schema.driverStandings).where(eq(schema.driverStandings.season, season)),
    db.select().from(schema.constructorStandings).where(eq(schema.constructorStandings.season, season)),
    db.select().from(schema.syncLog).orderBy(schema.syncLog.id)
  ])

  const lastSync = syncLogs.length > 0
    ? syncLogs[syncLogs.length - 1].syncedAt
    : null

  return {
    season,
    data: {
      races: races.length,
      drivers: drivers.length,
      constructors: constructors.length
    },
    lastSync,
    hasData: races.length > 0
  }
})
