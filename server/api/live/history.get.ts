import { useDB, schema } from '../../database'
import { desc, sql } from 'drizzle-orm'

// GET /api/live/history - Get the last race data for development/testing
export default defineEventHandler(async () => {
  const db = useDB()

  try {
    // Get the most recent race with results
    const lastRace = await db
      .select()
      .from(schema.raceResults)
      .orderBy(desc(schema.raceResults.id))
      .limit(1)

    if (!lastRace.length) {
      return {
        type: 'no-data',
        message: 'No race results in database'
      }
    }

    const race = lastRace[0]
    const { season, round } = race

    // Get all results for this race
    const results = await db
      .select()
      .from(schema.raceResults)
      .where(sql`season = ${season} AND round = ${round}`)
      .orderBy(sql`CAST(position AS INTEGER)`)

    // Get qualifying results
    const qualifying = await db
      .select()
      .from(schema.qualifyingResults)
      .where(sql`season = ${season} AND round = ${round}`)
      .orderBy(sql`CAST(position AS INTEGER)`)

    // Get pit stops
    const pitStops = await db
      .select()
      .from(schema.pitStops)
      .where(sql`session_key IN (SELECT session_key FROM sessions WHERE year = ${parseInt(season)})`)

    // Get stints for visualization
    const stints = await db
      .select()
      .from(schema.stints)
      .where(sql`session_key IN (SELECT session_key FROM sessions WHERE year = ${parseInt(season)})`)

    // Get laps for last lap times
    const laps = await db
      .select()
      .from(schema.laps)
      .where(sql`session_key IN (SELECT session_key FROM sessions WHERE year = ${parseInt(season)})`)
      .orderBy(desc(schema.laps.lapNumber))
      .limit(22) // One per driver (approximate)

    // Build timing data structure similar to live timing
    const timingData = {
      Lines: Object.fromEntries(
        results.map(r => [
          r.driverId || r.givenName,
          {
            Position: r.position,
            GapToLeader: r.grid === 1 ? '0.000' : r.milliseconds ? `+${(r.milliseconds / 1000).toFixed(3)}` : '-',
            LastLapTime: { Value: r.fastestLapTime || '-', OverallFastest: false, PersonalFastest: false },
            BestLapTime: { Value: r.fastestLapTime || '-' },
            NumberOfPitStops: 0,
            Retired: r.status !== 'Finished',
            Stopped: false,
            InPit: false,
            PitOut: false,
            Sectors: []
          }
        ])
      )
    }

    // Get race info
    const raceInfo = await db
      .select()
      .from(schema.races)
      .where(sql`season = ${season} AND round = ${round}`)
      .limit(1)

    const sessionInfo = raceInfo[0]
      ? {
          Meeting: {
            Name: raceInfo[0].raceName,
            Circuit: {
              ShortName: raceInfo[0].circuitName
            },
            Country: {
              Name: raceInfo[0].country
            }
          },
          Name: 'Race',
          Type: 'Race'
        }
      : null

    return {
      type: 'history',
      data: {
        sessionInfo,
        timingData,
        driverList: {},
        lapCount: { CurrentLap: 0, TotalLaps: 0 },
        trackStatus: null,
        weatherData: null,
        raceControlMessages: { Messages: {} },
        extrapolatedClock: null,
        sessionStatus: {},
        sessionData: { Season: season, Round: round },
        timingStats: {},
        timingAppData: {},
        championshipPrediction: {}
      },
      raceResults: results,
      qualifyingResults: qualifying,
      pitStops,
      stints,
      message: `Last race: ${raceInfo[0]?.raceName || 'Unknown'} (${season} R${round})`
    }
  } catch (error) {
    console.error('[live/history] Error:', error)
    return {
      type: 'error',
      message: (error as any).message
    }
  }
})
