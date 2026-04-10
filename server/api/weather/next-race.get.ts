// Weather for next race location via Open-Meteo (free, no API key)
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.jolpicaBaseUrl || 'https://api.jolpi.ca/ergast/f1'

  // Get next race with circuit location
  const res = await $fetch<any>(`${baseUrl}/current/next.json`).catch(() => null)
  const race = res?.MRData?.RaceTable?.Races?.[0]
  if (!race) return null

  const lat = race.Circuit?.Location?.lat
  const lng = race.Circuit?.Location?.long
  if (!lat || !lng) return null

  // Get race date for forecast
  const raceDate = race.date

  // Fetch weather from Open-Meteo (free, no key needed)
  // Current weather + daily forecast for race day
  const weather = await $fetch<any>('https://api.open-meteo.com/v1/forecast', {
    query: {
      latitude: lat,
      longitude: lng,
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,cloud_cover',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,wind_speed_10m_max',
      timezone: 'auto',
      forecast_days: 7
    }
  }).catch(() => null)

  if (!weather) return null

  // Find race day in forecast
  const raceDayIdx = weather.daily?.time?.indexOf(raceDate) ?? -1

  return {
    circuit: race.Circuit?.circuitName,
    locality: race.Circuit?.Location?.locality,
    country: race.Circuit?.Location?.country,
    raceDate,
    current: weather.current ? {
      temp: weather.current.temperature_2m,
      humidity: weather.current.relative_humidity_2m,
      windSpeed: weather.current.wind_speed_10m,
      windDir: weather.current.wind_direction_10m,
      weatherCode: weather.current.weather_code,
      cloudCover: weather.current.cloud_cover
    } : null,
    raceDay: raceDayIdx >= 0 ? {
      tempMax: weather.daily.temperature_2m_max[raceDayIdx],
      tempMin: weather.daily.temperature_2m_min[raceDayIdx],
      rainChance: weather.daily.precipitation_probability_max[raceDayIdx],
      weatherCode: weather.daily.weather_code[raceDayIdx],
      windMax: weather.daily.wind_speed_10m_max[raceDayIdx]
    } : null
  }
})
