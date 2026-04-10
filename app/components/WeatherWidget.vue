<script setup lang="ts">
const { data: weather } = useFetch('/api/weather/next-race', { lazy: true })

// WMO weather codes to icons and labels
function weatherInfo(code: number | null): { icon: string; label: string } {
  if (code == null) return { icon: '---', label: 'Unknown' }
  if (code === 0) return { icon: '☀️', label: 'Clear' }
  if (code <= 3) return { icon: '⛅', label: 'Partly Cloudy' }
  if (code <= 48) return { icon: '🌫️', label: 'Fog' }
  if (code <= 57) return { icon: '🌧️', label: 'Drizzle' }
  if (code <= 67) return { icon: '🌧️', label: 'Rain' }
  if (code <= 77) return { icon: '🌨️', label: 'Snow' }
  if (code <= 82) return { icon: '🌧️', label: 'Showers' }
  if (code <= 86) return { icon: '🌨️', label: 'Snow Showers' }
  if (code <= 99) return { icon: '⛈️', label: 'Thunderstorm' }
  return { icon: '🌤️', label: 'Mixed' }
}
</script>

<template>
  <div v-if="weather" class="card-glass card-glow rounded-2xl overflow-hidden">
    <div class="accent-line-red w-full" />
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[10px] text-[#e10600] uppercase tracking-[0.2em] font-bold">Weather</span>
        <span class="text-[10px] text-[#444] font-medium">{{ weather.locality }}</span>
      </div>

      <!-- Current conditions -->
      <div v-if="weather.current" class="mb-4">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-3xl">{{ weatherInfo(weather.current.weatherCode).icon }}</span>
          <div>
            <div class="font-timing text-2xl font-black text-[#f0f0f0]">{{ weather.current.temp }}°C</div>
            <div class="text-[10px] text-[#555]">{{ weatherInfo(weather.current.weatherCode).label }}</div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-[#0a0a0a] rounded-lg p-2 text-center">
            <div class="text-[9px] text-[#444] uppercase tracking-wider mb-0.5">Humidity</div>
            <div class="font-timing text-xs text-[#8a8a8a] font-bold">{{ weather.current.humidity }}%</div>
          </div>
          <div class="bg-[#0a0a0a] rounded-lg p-2 text-center">
            <div class="text-[9px] text-[#444] uppercase tracking-wider mb-0.5">Wind</div>
            <div class="font-timing text-xs text-[#8a8a8a] font-bold">{{ weather.current.windSpeed }} km/h</div>
          </div>
          <div class="bg-[#0a0a0a] rounded-lg p-2 text-center">
            <div class="text-[9px] text-[#444] uppercase tracking-wider mb-0.5">Clouds</div>
            <div class="font-timing text-xs text-[#8a8a8a] font-bold">{{ weather.current.cloudCover }}%</div>
          </div>
        </div>
      </div>

      <!-- Race day forecast -->
      <div v-if="weather.raceDay" class="border-t border-[#141414] pt-3">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-px bg-[#e10600]/40" />
          <span class="text-[9px] text-[#444] uppercase tracking-[0.15em] font-bold">Race Day Forecast</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ weatherInfo(weather.raceDay.weatherCode).icon }}</span>
            <div>
              <div class="font-timing text-sm text-[#f0f0f0] font-bold">
                {{ weather.raceDay.tempMin }}° — {{ weather.raceDay.tempMax }}°C
              </div>
              <div class="text-[10px] text-[#555]">{{ weatherInfo(weather.raceDay.weatherCode).label }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-timing text-sm font-bold"
                 :class="weather.raceDay.rainChance > 50 ? 'text-blue-400' : weather.raceDay.rainChance > 20 ? 'text-[#ffc906]' : 'text-[#00d25b]'">
              {{ weather.raceDay.rainChance }}%
            </div>
            <div class="text-[9px] text-[#444]">Rain</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
