import { useDB, schema } from '../../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const season = getRouterParam(event, 'season') || String(new Date().getFullYear())
  const db = useDB()

  const standings = await db.select()
    .from(schema.driverStandings)
    .where(eq(schema.driverStandings.season, season))
    .orderBy(schema.driverStandings.position)

  return standings
})
