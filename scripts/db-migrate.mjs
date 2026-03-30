#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const migrationsFolder = join(root, 'drizzle')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

if (!existsSync(join(migrationsFolder, 'meta', '_journal.json'))) {
  console.error(`No drizzle migrations at ${migrationsFolder} (expected meta/_journal.json)`)
  process.exit(1)
}

const migrationClient = postgres(url, { max: 1, prepare: false })
try {
  await migrate(drizzle(migrationClient), { migrationsFolder })
  console.log('[db:migrate] OK', migrationsFolder)
} catch (e) {
  console.error('[db:migrate] Failed:', e)
  process.exit(1)
} finally {
  await migrationClient.end()
}
