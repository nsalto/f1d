import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { resolve } from 'path'
import * as schema from './schema'

function getDBPath() {
  // In dev, use project root. In production, use cwd
  const base = process.env.NUXT_APP_ROOT_DIR || process.cwd()
  return resolve(base, 'data', 'f1.db')
}

let _db: ReturnType<typeof drizzle> | null = null
let _dbPath: string | null = null

export function useDB() {
  const dbPath = getDBPath()
  if (!_db || _dbPath !== dbPath) {
    console.log(`[db] Connecting to ${dbPath}`)
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    _db = drizzle(sqlite, { schema })
    _dbPath = dbPath
  }
  return _db
}

export { schema }
