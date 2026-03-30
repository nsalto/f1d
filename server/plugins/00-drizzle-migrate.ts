import { existsSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

function resolveMigrationsFolder(): string {
  const candidates = [
    join(process.cwd(), 'drizzle'),
    join(process.cwd(), '.output', 'server', 'drizzle')
  ]
  for (const dir of candidates) {
    if (existsSync(join(dir, 'meta', '_journal.json'))) {
      return dir
    }
  }
  throw new Error(
    `[f1-dashboard] Drizzle migrations not found (need meta/_journal.json). Tried:\n${candidates.map(c => `  - ${c}`).join('\n')}`
  )
}

export default defineNitroPlugin(async () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required for database migrations on startup')
  }

  const migrationsFolder = resolveMigrationsFolder()
  const migrationClient = postgres(url, { max: 1, prepare: false })
  try {
    await migrate(drizzle(migrationClient), { migrationsFolder })
    console.log('[f1-dashboard] Database migrations applied from', migrationsFolder)
  } finally {
    await migrationClient.end()
  }
})
