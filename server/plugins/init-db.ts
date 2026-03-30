import Database from 'better-sqlite3'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { drizzle } from 'drizzle-orm/better-sqlite3'

export default defineNitroPlugin(async () => {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = join(dataDir, 'f1.db')
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')

  // Create tables directly from schema
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season TEXT NOT NULL,
      round INTEGER NOT NULL,
      race_name TEXT NOT NULL,
      circuit_id TEXT NOT NULL,
      circuit_name TEXT NOT NULL,
      locality TEXT,
      country TEXT,
      date TEXT NOT NULL,
      time TEXT,
      fp1_date TEXT, fp1_time TEXT,
      fp2_date TEXT, fp2_time TEXT,
      fp3_date TEXT, fp3_time TEXT,
      qualy_date TEXT, qualy_time TEXT,
      sprint_date TEXT, sprint_time TEXT
    );

    CREATE TABLE IF NOT EXISTS driver_standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season TEXT NOT NULL,
      position INTEGER NOT NULL,
      points REAL NOT NULL,
      wins INTEGER NOT NULL,
      driver_id TEXT NOT NULL,
      driver_code TEXT,
      driver_number TEXT,
      given_name TEXT NOT NULL,
      family_name TEXT NOT NULL,
      nationality TEXT,
      constructor_id TEXT,
      constructor_name TEXT
    );

    CREATE TABLE IF NOT EXISTS constructor_standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season TEXT NOT NULL,
      position INTEGER NOT NULL,
      points REAL NOT NULL,
      wins INTEGER NOT NULL,
      constructor_id TEXT NOT NULL,
      constructor_name TEXT NOT NULL,
      nationality TEXT
    );

    CREATE TABLE IF NOT EXISTS race_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season TEXT NOT NULL,
      round INTEGER NOT NULL,
      position INTEGER,
      position_text TEXT,
      points REAL,
      grid INTEGER,
      laps INTEGER,
      status TEXT,
      time TEXT,
      milliseconds INTEGER,
      fastest_lap_rank INTEGER,
      fastest_lap_lap INTEGER,
      fastest_lap_time TEXT,
      driver_id TEXT NOT NULL,
      driver_code TEXT,
      given_name TEXT,
      family_name TEXT,
      constructor_id TEXT,
      constructor_name TEXT
    );

    CREATE TABLE IF NOT EXISTS qualifying_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season TEXT NOT NULL,
      round INTEGER NOT NULL,
      position INTEGER,
      driver_id TEXT NOT NULL,
      driver_code TEXT,
      given_name TEXT,
      family_name TEXT,
      constructor_id TEXT,
      constructor_name TEXT,
      q1 TEXT, q2 TEXT, q3 TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_key INTEGER PRIMARY KEY,
      session_name TEXT NOT NULL,
      session_type TEXT,
      meeting_key INTEGER,
      circuit_short_name TEXT,
      country_name TEXT,
      date_start TEXT,
      date_end TEXT,
      year INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS laps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_key INTEGER NOT NULL,
      driver_number INTEGER NOT NULL,
      lap_number INTEGER NOT NULL,
      lap_duration REAL,
      sector_1 REAL, sector_2 REAL, sector_3 REAL,
      i1_speed REAL, i2_speed REAL, st_speed REAL,
      is_pit_out_lap INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pit_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_key INTEGER NOT NULL,
      driver_number INTEGER NOT NULL,
      lap_number INTEGER NOT NULL,
      pit_duration REAL,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS stints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_key INTEGER NOT NULL,
      driver_number INTEGER NOT NULL,
      stint_number INTEGER NOT NULL,
      compound TEXT,
      lap_start INTEGER,
      lap_end INTEGER,
      tyre_age_at_start INTEGER
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_key INTEGER NOT NULL,
      driver_number INTEGER NOT NULL,
      broadcast_name TEXT,
      full_name TEXT,
      name_acronym TEXT,
      team_name TEXT,
      team_colour TEXT,
      headshot_url TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      key TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );
  `)

  sqlite.close()
  console.log('[f1-dashboard] Database initialized')
})
