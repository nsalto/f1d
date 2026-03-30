import { useDB, schema } from '../../database'
import { eq, and } from 'drizzle-orm'

// GET /api/openf1/race-data?season=2025&round=1
// Returns laps, pits, stints, drivers for a race
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const season = String(query.season || String(new Date().getFullYear()))
  const round = Number(query.round)
  const db = useDB()

  // Find the race to get country
  const race = await db.select().from(schema.races)
    .where(and(eq(schema.races.season, season), eq(schema.races.round, round)))
    .limit(1)

  if (!race.length) {
    throw createError({ statusCode: 404, message: 'Race not found' })
  }

  // Find matching OpenF1 session
  const allSessions = await db.select().from(schema.sessions)
    .where(and(
      eq(schema.sessions.year, parseInt(season)),
      eq(schema.sessions.sessionName, 'Race')
    ))

  const matchedSession = allSessions.find(s =>
    s.countryName?.toLowerCase().includes(race[0].country?.toLowerCase() || '') ||
    race[0].country?.toLowerCase().includes(s.countryName?.toLowerCase() || '')
  )

  if (!matchedSession) {
    return { laps: [], pitStops: [], stints: [], drivers: [], sessionKey: null }
  }

  const sk = matchedSession.sessionKey

  const [lapsData, pitData, stintsData, driversData] = await Promise.all([
    db.select().from(schema.laps).where(eq(schema.laps.sessionKey, sk)),
    db.select().from(schema.pitStops).where(eq(schema.pitStops.sessionKey, sk)),
    db.select().from(schema.stints).where(eq(schema.stints.sessionKey, sk)),
    db.select().from(schema.drivers).where(eq(schema.drivers.sessionKey, sk))
  ])

  return {
    sessionKey: sk,
    laps: lapsData,
    pitStops: pitData,
    stints: stintsData,
    drivers: driversData
  }
})
