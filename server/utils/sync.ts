import { eq, and } from 'drizzle-orm'
import { useDB, schema } from '../database'

const CURRENT_SEASON = String(new Date().getFullYear())

// Check if we already synced something
async function hasSynced(entity: string, key: string): Promise<boolean> {
  const db = useDB()
  const result = await db.select()
    .from(schema.syncLog)
    .where(and(eq(schema.syncLog.entity, entity), eq(schema.syncLog.key, key)))
    .limit(1)
  return result.length > 0
}

async function markSynced(entity: string, key: string) {
  const db = useDB()
  await db.insert(schema.syncLog).values({
    entity,
    key,
    syncedAt: new Date().toISOString()
  })
}

// Sync calendar from Jolpica
export async function syncCalendar(season: string = CURRENT_SEASON) {
  const syncKey = `calendar-${season}`
  if (await hasSynced('calendar', syncKey)) return

  const db = useDB()
  const data: any = await fetchJolpica(`/${season}.json?limit=30`)
  const raceTable = data.RaceTable?.Races || []

  for (const race of raceTable) {
    await db.insert(schema.races).values({
      season: race.season,
      round: parseInt(race.round),
      raceName: race.raceName,
      circuitId: race.Circuit.circuitId,
      circuitName: race.Circuit.circuitName,
      locality: race.Circuit.Location?.locality,
      country: race.Circuit.Location?.country,
      date: race.date,
      time: race.time || null,
      fp1Date: race.FirstPractice?.date || null,
      fp1Time: race.FirstPractice?.time || null,
      fp2Date: race.SecondPractice?.date || null,
      fp2Time: race.SecondPractice?.time || null,
      fp3Date: race.ThirdPractice?.date || null,
      fp3Time: race.ThirdPractice?.time || null,
      qualyDate: race.Qualifying?.date || null,
      qualyTime: race.Qualifying?.time || null,
      sprintDate: race.Sprint?.date || null,
      sprintTime: race.Sprint?.time || null
    })
  }

  await markSynced('calendar', syncKey)
  console.log(`[sync] Calendar ${season}: ${raceTable.length} races`)
}

// Sync driver standings from Jolpica
export async function syncDriverStandings(season: string = CURRENT_SEASON) {
  const db = useDB()

  // Always refresh standings (delete old + reinsert)
  await db.delete(schema.driverStandings).where(eq(schema.driverStandings.season, season))

  const data: any = await fetchJolpica(`/${season}/driverStandings.json`)
  const standings = data.StandingsTable?.StandingsLists?.[0]?.DriverStandings || []

  for (const s of standings) {
    await db.insert(schema.driverStandings).values({
      season,
      position: parseInt(s.position),
      points: parseFloat(s.points),
      wins: parseInt(s.wins),
      driverId: s.Driver.driverId,
      driverCode: s.Driver.code || null,
      driverNumber: s.Driver.permanentNumber || null,
      givenName: s.Driver.givenName,
      familyName: s.Driver.familyName,
      nationality: s.Driver.nationality || null,
      constructorId: s.Constructors?.[0]?.constructorId || null,
      constructorName: s.Constructors?.[0]?.name || null
    })
  }

  console.log(`[sync] Driver standings ${season}: ${standings.length} drivers`)
}

// Sync constructor standings from Jolpica
export async function syncConstructorStandings(season: string = CURRENT_SEASON) {
  const db = useDB()

  await db.delete(schema.constructorStandings).where(eq(schema.constructorStandings.season, season))

  const data: any = await fetchJolpica(`/${season}/constructorStandings.json`)
  const standings = data.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || []

  for (const s of standings) {
    await db.insert(schema.constructorStandings).values({
      season,
      position: parseInt(s.position),
      points: parseFloat(s.points),
      wins: parseInt(s.wins),
      constructorId: s.Constructor.constructorId,
      constructorName: s.Constructor.name,
      nationality: s.Constructor.nationality || null
    })
  }

  console.log(`[sync] Constructor standings ${season}: ${standings.length} constructors`)
}

// Sync race results for a specific round from Jolpica
export async function syncRaceResults(season: string, round: number) {
  const syncKey = `results-${season}-${round}`
  if (await hasSynced('results', syncKey)) return

  const db = useDB()
  const data: any = await fetchJolpica(`/${season}/${round}/results.json`)
  const results = data.RaceTable?.Races?.[0]?.Results || []

  if (results.length === 0) return // Race hasn't happened yet

  for (const r of results) {
    await db.insert(schema.raceResults).values({
      season,
      round,
      position: parseInt(r.position) || null,
      positionText: r.positionText,
      points: parseFloat(r.points) || 0,
      grid: parseInt(r.grid) || null,
      laps: parseInt(r.laps) || null,
      status: r.status,
      time: r.Time?.time || null,
      milliseconds: parseInt(r.Time?.millis) || null,
      fastestLapRank: parseInt(r.FastestLap?.rank) || null,
      fastestLapLap: parseInt(r.FastestLap?.lap) || null,
      fastestLapTime: r.FastestLap?.Time?.time || null,
      driverId: r.Driver.driverId,
      driverCode: r.Driver.code || null,
      givenName: r.Driver.givenName,
      familyName: r.Driver.familyName,
      constructorId: r.Constructor?.constructorId || null,
      constructorName: r.Constructor?.name || null
    })
  }

  await markSynced('results', syncKey)
  console.log(`[sync] Race results ${season} R${round}: ${results.length} entries`)
}

// Sync qualifying results
export async function syncQualifyingResults(season: string, round: number) {
  const syncKey = `qualifying-${season}-${round}`
  if (await hasSynced('qualifying', syncKey)) return

  const db = useDB()
  const data: any = await fetchJolpica(`/${season}/${round}/qualifying.json`)
  const results = data.RaceTable?.Races?.[0]?.QualifyingResults || []

  if (results.length === 0) return

  for (const r of results) {
    await db.insert(schema.qualifyingResults).values({
      season,
      round,
      position: parseInt(r.position) || null,
      driverId: r.Driver.driverId,
      driverCode: r.Driver.code || null,
      givenName: r.Driver.givenName,
      familyName: r.Driver.familyName,
      constructorId: r.Constructor?.constructorId || null,
      constructorName: r.Constructor?.name || null,
      q1: r.Q1 || null,
      q2: r.Q2 || null,
      q3: r.Q3 || null
    })
  }

  await markSynced('qualifying', syncKey)
  console.log(`[sync] Qualifying ${season} R${round}: ${results.length} entries`)
}

// Sync OpenF1 sessions for a year
export async function syncOpenF1Sessions(year: number = 2025) {
  const syncKey = `sessions-${year}`
  if (await hasSynced('openf1-sessions', syncKey)) return

  const db = useDB()
  const sessionsData = await fetchOpenF1<any[]>('sessions', { year })

  for (const s of sessionsData) {
    await db.insert(schema.sessions).values({
      sessionKey: s.session_key,
      sessionName: s.session_name,
      sessionType: s.session_type || null,
      meetingKey: s.meeting_key || null,
      circuitShortName: s.circuit_short_name || null,
      countryName: s.country_name || null,
      dateStart: s.date_start || null,
      dateEnd: s.date_end || null,
      year
    }).onConflictDoNothing({ target: schema.sessions.sessionKey })
  }

  await markSynced('openf1-sessions', syncKey)
  console.log(`[sync] OpenF1 sessions ${year}: ${sessionsData.length} sessions`)
}

// Sync OpenF1 race data (laps, pits, stints, drivers) for a session
export async function syncOpenF1RaceData(sessionKey: number) {
  const syncKey = `openf1-race-${sessionKey}`
  if (await hasSynced('openf1-race', syncKey)) return

  const db = useDB()

  // Fetch all in parallel (4 requests)
  const [lapsData, pitsData, stintsData, driversData] = await Promise.all([
    fetchOpenF1<any[]>('laps', { session_key: sessionKey }),
    fetchOpenF1<any[]>('pit', { session_key: sessionKey }),
    fetchOpenF1<any[]>('stints', { session_key: sessionKey }),
    fetchOpenF1<any[]>('drivers', { session_key: sessionKey })
  ])

  // Insert laps
  for (const l of lapsData) {
    await db.insert(schema.laps).values({
      sessionKey: l.session_key,
      driverNumber: l.driver_number,
      lapNumber: l.lap_number,
      lapDuration: l.lap_duration || null,
      sector1: l.duration_sector_1 || null,
      sector2: l.duration_sector_2 || null,
      sector3: l.duration_sector_3 || null,
      i1Speed: l.i1_speed || null,
      i2Speed: l.i2_speed || null,
      stSpeed: l.st_speed || null,
      isPitOutLap: l.is_pit_out_lap || false
    })
  }

  // Insert pit stops
  for (const p of pitsData) {
    await db.insert(schema.pitStops).values({
      sessionKey: p.session_key,
      driverNumber: p.driver_number,
      lapNumber: p.lap_number,
      pitDuration: p.pit_duration || null,
      date: p.date || null
    })
  }

  // Insert stints
  for (const s of stintsData) {
    await db.insert(schema.stints).values({
      sessionKey: s.session_key,
      driverNumber: s.driver_number,
      stintNumber: s.stint_number,
      compound: s.compound || null,
      lapStart: s.lap_start || null,
      lapEnd: s.lap_end || null,
      tyreAgeAtStart: s.tyre_age_at_start || null
    })
  }

  // Insert drivers
  for (const d of driversData) {
    await db.insert(schema.drivers).values({
      sessionKey: d.session_key,
      driverNumber: d.driver_number,
      broadcastName: d.broadcast_name || null,
      fullName: d.full_name || null,
      nameAcronym: d.name_acronym || null,
      teamName: d.team_name || null,
      teamColour: d.team_colour || null,
      headshotUrl: d.headshot_url || null
    })
  }

  await markSynced('openf1-race', syncKey)
  console.log(`[sync] OpenF1 session ${sessionKey}: ${lapsData.length} laps, ${pitsData.length} pits, ${stintsData.length} stints, ${driversData.length} drivers`)
}
