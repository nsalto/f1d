import { useDB, schema } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const season = getRouterParam(event, 'season') || String(new Date().getFullYear())
  const db = useDB()

  const raceList = await db.select()
    .from(schema.races)
    .where(eq(schema.races.season, season))
    .orderBy(schema.races.round)

  return raceList
})
