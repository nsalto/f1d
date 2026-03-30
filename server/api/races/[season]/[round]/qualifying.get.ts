import { useDB, schema } from '../../../../database'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const season = getRouterParam(event, 'season') || String(new Date().getFullYear())
  const round = Number(getRouterParam(event, 'round'))
  const db = useDB()

  const results = await db.select()
    .from(schema.qualifyingResults)
    .where(and(
      eq(schema.qualifyingResults.season, season),
      eq(schema.qualifyingResults.round, round)
    ))
    .orderBy(schema.qualifyingResults.position)

  return results
})
