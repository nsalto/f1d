import { useDB, schema } from '../../../../database'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const season = getRouterParam(event, 'season') || String(new Date().getFullYear())
  const round = Number(getRouterParam(event, 'round'))
  const db = useDB()

  const results = await db.select()
    .from(schema.raceResults)
    .where(and(
      eq(schema.raceResults.season, season),
      eq(schema.raceResults.round, round)
    ))
    .orderBy(schema.raceResults.position)

  return results
})
