import { useDB, schema } from '../../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const season = getRouterParam(event, 'season') || String(new Date().getFullYear())
  const db = useDB()

  const standings = await db.select()
    .from(schema.constructorStandings)
    .where(eq(schema.constructorStandings.season, season))
    .orderBy(schema.constructorStandings.position)

  return standings
})
