import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add a PostgreSQL service on Railway and link it, or set DATABASE_URL locally.'
    )
  }
  return url
}

let _sql: ReturnType<typeof postgres> | null = null
let _db: PostgresJsDatabase<typeof schema> | null = null

export function useDB() {
  if (!_db) {
    const url = getDatabaseUrl()
    // prepare: false works with PgBouncer / transaction poolers (Railway sometimes proxies)
    _sql = postgres(url, { max: 10, prepare: false })
    _db = drizzle(_sql, { schema })
  }
  return _db
}

export { schema }
