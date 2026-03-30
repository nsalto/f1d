import { useDB, schema } from '../../database'
import { desc, sql } from 'drizzle-orm'
import { DRIVERS_2026 } from '../../utils/drivers-2026'
import { getTeamColor } from '../../utils/team-colors'

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

    // Get compound for each driver from stints (latest compound)
    const driverCompounds: Record<number, string> = {}
    for (const stint of stints) {
      if (stint.driverNumber) {
        driverCompounds[stint.driverNumber] = stint.compound || 'UNKNOWN'
      }
    }

    // Build driverList with correct team info from DRIVERS_2026
    const driverList: Record<string, any> = {}

    for (const r of results) {
      // Map by driver number from the result's implicit driver info
      // Find driver in DRIVERS_2026 by name match
      const driver2026 = DRIVERS_2026.find(d =>
        d.givenName.toLowerCase() === (r.givenName || '').toLowerCase() &&
        d.familyName.toLowerCase() === (r.familyName || '').toLowerCase()
      )

      if (driver2026) {
        // Use driver number as the key (matches live timing)
        const driverNum = driver2026.number
        const teamColor = getTeamColor(driver2026.team)

        driverList[driverNum] = {
          Tla: driver2026.nameAcronym,
          BroadcastName: `${driver2026.givenName} ${driver2026.familyName}`,
          FullName: `${driver2026.givenName} ${driver2026.familyName}`,
          TeamName: driver2026.team,
          TeamId: driver2026.teamId, // Add teamId for logo resolution
          TeamColour: teamColor.substring(1) // Remove # for API format (API expects "FF0000" not "#FF0000")
        }
      }
    }

    // Build timing data structure similar to live timing
    const timingData = {
      Lines: Object.fromEntries(
        results.map(r => {
          // Find driver number from DRIVERS_2026 by name match
          const driver2026 = DRIVERS_2026.find(d =>
            d.givenName.toLowerCase() === (r.givenName || '').toLowerCase() &&
            d.familyName.toLowerCase() === (r.familyName || '').toLowerCase()
          )

          if (!driver2026) {
            return [] // Skip if not found
          }

          const driverNum = parseInt(driver2026.number) || 0

          return [
            driver2026.number, // Use driver number as key (matches live timing)
            {
              Position: r.position,
              GapToLeader: r.grid === 1 ? '0.000' : r.milliseconds ? `+${(r.milliseconds / 1000).toFixed(3)}` : '-',
              LastLapTime: { Value: r.fastestLapTime || '-', OverallFastest: false, PersonalFastest: false },
              BestLapTime: { Value: r.fastestLapTime || '-' },
              Compound: driverCompounds[driverNum] || '',
              NumberOfPitStops: 0,
              Retired: r.status !== 'Finished',
              Stopped: false,
              InPit: false,
              PitOut: false,
              Sectors: []
            }
          ]
        }).filter(entry => entry.length > 0) // Filter out skipped drivers
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
        driverList,
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
