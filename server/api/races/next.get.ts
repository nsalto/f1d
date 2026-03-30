import { useDB, schema } from '../../database'
import { eq, gte } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()
  const today = new Date().toISOString().split('T')[0]

  const nextRace = await db.select()
    .from(schema.races)
    .where(gte(schema.races.date, today))
    .orderBy(schema.races.date)
    .limit(1)

  return nextRace[0] || null
})
