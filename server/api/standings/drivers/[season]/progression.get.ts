export default defineEventHandler(async (event) => {
  const season = getRouterParam(event, 'season') || String(new Date().getFullYear())
  const config = useRuntimeConfig()
  const baseUrl = config.public.jolpicaBaseUrl || 'https://api.jolpi.ca/ergast/f1'

  // Get the calendar to know how many rounds
  const calRes = await $fetch<any>(`${baseUrl}/${season}.json`)
  const totalRounds = parseInt(calRes?.MRData?.RaceTable?.Races?.length || '0')
  if (!totalRounds) return []

  // Fetch standings for each completed round (in parallel, max 24)
  const promises = Array.from({ length: totalRounds }, (_, i) =>
    $fetch<any>(`${baseUrl}/${season}/${i + 1}/driverStandings.json`).catch(() => null)
  )
  const results = await Promise.all(promises)

  // Build progression: { driverId, familyName, constructorName, points: [r1, r2, ...] }
  const driverMap = new Map<string, { driverId: string; familyName: string; constructorName: string; points: (number | null)[] }>()

  for (let r = 0; r < results.length; r++) {
    const lists = results[r]?.MRData?.StandingsTable?.StandingsLists
    if (!lists?.length) continue

    for (const ds of lists[0].DriverStandings) {
      const id = ds.Driver.driverId
      if (!driverMap.has(id)) {
        driverMap.set(id, {
          driverId: id,
          familyName: ds.Driver.familyName,
          constructorName: ds.Constructors?.[0]?.name || '',
          points: new Array(totalRounds).fill(null)
        })
      }
      driverMap.get(id)!.points[r] = parseFloat(ds.points)
    }
  }

  // Sort by final points descending, return top 10
  return Array.from(driverMap.values())
    .sort((a, b) => {
      const aLast = a.points.filter(p => p !== null).pop() || 0
      const bLast = b.points.filter(p => p !== null).pop() || 0
      return bLast - aLast
    })
    .slice(0, 10)
})
