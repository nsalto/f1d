import { join } from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

export default defineNitroPlugin(async () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required for database migrations on startup')
  }

  const migrationClient = postgres(url, { max: 1, prepare: false })
  try {
    const migrationsFolder = join(process.cwd(), 'drizzle')
    await migrate(drizzle(migrationClient), { migrationsFolder })
    console.log('[f1-dashboard] Database migrations applied')
  } finally {
    await migrationClient.end()
  }
})
