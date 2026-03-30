import { pgTable, serial, text, integer, real, boolean } from 'drizzle-orm/pg-core'

// Seasons calendar
export const races = pgTable('races', {
  id: serial('id').primaryKey(),
  season: text('season').notNull(),
  round: integer('round').notNull(),
  raceName: text('race_name').notNull(),
  circuitId: text('circuit_id').notNull(),
  circuitName: text('circuit_name').notNull(),
  locality: text('locality'),
  country: text('country'),
  date: text('date').notNull(),
  time: text('time'),
  fp1Date: text('fp1_date'),
  fp1Time: text('fp1_time'),
  fp2Date: text('fp2_date'),
  fp2Time: text('fp2_time'),
  fp3Date: text('fp3_date'),
  fp3Time: text('fp3_time'),
  qualyDate: text('qualy_date'),
  qualyTime: text('qualy_time'),
  sprintDate: text('sprint_date'),
  sprintTime: text('sprint_time')
})

// Driver standings
export const driverStandings = pgTable('driver_standings', {
  id: serial('id').primaryKey(),
  season: text('season').notNull(),
  position: integer('position').notNull(),
  points: real('points').notNull(),
  wins: integer('wins').notNull(),
  driverId: text('driver_id').notNull(),
  driverCode: text('driver_code'),
  driverNumber: text('driver_number'),
  givenName: text('given_name').notNull(),
  familyName: text('family_name').notNull(),
  nationality: text('nationality'),
  constructorId: text('constructor_id'),
  constructorName: text('constructor_name')
})

// Constructor standings
export const constructorStandings = pgTable('constructor_standings', {
  id: serial('id').primaryKey(),
  season: text('season').notNull(),
  position: integer('position').notNull(),
  points: real('points').notNull(),
  wins: integer('wins').notNull(),
  constructorId: text('constructor_id').notNull(),
  constructorName: text('constructor_name').notNull(),
  nationality: text('nationality')
})

// Race results
export const raceResults = pgTable('race_results', {
  id: serial('id').primaryKey(),
  season: text('season').notNull(),
  round: integer('round').notNull(),
  position: integer('position'),
  positionText: text('position_text'),
  points: real('points'),
  grid: integer('grid'),
  laps: integer('laps'),
  status: text('status'),
  time: text('time'),
  milliseconds: integer('milliseconds'),
  fastestLapRank: integer('fastest_lap_rank'),
  fastestLapLap: integer('fastest_lap_lap'),
  fastestLapTime: text('fastest_lap_time'),
  driverId: text('driver_id').notNull(),
  driverCode: text('driver_code'),
  givenName: text('given_name'),
  familyName: text('family_name'),
  constructorId: text('constructor_id'),
  constructorName: text('constructor_name')
})

// Qualifying results
export const qualifyingResults = pgTable('qualifying_results', {
  id: serial('id').primaryKey(),
  season: text('season').notNull(),
  round: integer('round').notNull(),
  position: integer('position'),
  driverId: text('driver_id').notNull(),
  driverCode: text('driver_code'),
  givenName: text('given_name'),
  familyName: text('family_name'),
  constructorId: text('constructor_id'),
  constructorName: text('constructor_name'),
  q1: text('q1'),
  q2: text('q2'),
  q3: text('q3')
})

// OpenF1 Sessions (to map session_key)
export const sessions = pgTable('sessions', {
  sessionKey: integer('session_key').primaryKey(),
  sessionName: text('session_name').notNull(),
  sessionType: text('session_type'),
  meetingKey: integer('meeting_key'),
  circuitShortName: text('circuit_short_name'),
  countryName: text('country_name'),
  dateStart: text('date_start'),
  dateEnd: text('date_end'),
  year: integer('year').notNull()
})

// OpenF1 Lap data
export const laps = pgTable('laps', {
  id: serial('id').primaryKey(),
  sessionKey: integer('session_key').notNull(),
  driverNumber: integer('driver_number').notNull(),
  lapNumber: integer('lap_number').notNull(),
  lapDuration: real('lap_duration'),
  sector1: real('sector_1'),
  sector2: real('sector_2'),
  sector3: real('sector_3'),
  i1Speed: real('i1_speed'),
  i2Speed: real('i2_speed'),
  stSpeed: real('st_speed'),
  isPitOutLap: boolean('is_pit_out_lap').default(false)
})

// OpenF1 Pit stops
export const pitStops = pgTable('pit_stops', {
  id: serial('id').primaryKey(),
  sessionKey: integer('session_key').notNull(),
  driverNumber: integer('driver_number').notNull(),
  lapNumber: integer('lap_number').notNull(),
  pitDuration: real('pit_duration'),
  date: text('date')
})

// OpenF1 Stints (tyre strategy)
export const stints = pgTable('stints', {
  id: serial('id').primaryKey(),
  sessionKey: integer('session_key').notNull(),
  driverNumber: integer('driver_number').notNull(),
  stintNumber: integer('stint_number').notNull(),
  compound: text('compound'),
  lapStart: integer('lap_start'),
  lapEnd: integer('lap_end'),
  tyreAgeAtStart: integer('tyre_age_at_start')
})

// OpenF1 Drivers (per session, has headshots and team colors)
export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),
  sessionKey: integer('session_key').notNull(),
  driverNumber: integer('driver_number').notNull(),
  broadcastName: text('broadcast_name'),
  fullName: text('full_name'),
  nameAcronym: text('name_acronym'),
  teamName: text('team_name'),
  teamColour: text('team_colour'),
  headshotUrl: text('headshot_url')
})

// Sync log to track what we've already fetched
export const syncLog = pgTable('sync_log', {
  id: serial('id').primaryKey(),
  entity: text('entity').notNull(),
  key: text('key').notNull(),
  syncedAt: text('synced_at').notNull()
})
