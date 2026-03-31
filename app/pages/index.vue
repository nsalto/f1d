<script setup lang="ts">
import { getCountryFlag } from '~/utils/formatters'
import { getTeamColor } from '~/utils/team-colors'
import { getTeamIdByName } from '~/utils/drivers-2026'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: nextRace } = useFetch('/api/races/next')
const { data: drivers } = useFetch(`/api/standings/drivers/${currentSeason}`)
const { data: constructors } = useFetch(`/api/standings/constructors/${currentSeason}`)

const topDrivers = computed(() => drivers.value || [])
const topConstructors = computed(() => constructors.value || [])
const maxPoints = computed(() => topDrivers.value[0]?.points || 1)

// Helper to get team logo ID
function getTeamLogo(teamName: string): string {
  const teamId = getTeamIdByName(teamName)
  if (teamId) return teamId
  // Fallback
  return teamName.replace(/\s+F1\s+Team\s*$/i, '').toLowerCase().replace(/\s+/g, '-')
}

// Countdown
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let interval: ReturnType<typeof setInterval>

function updateCountdown() {
  if (!nextRace.value?.date) return
  const raceDate = new Date(`${nextRace.value.date}T${nextRace.value.time || '14:00:00Z'}`)
  const diff = Math.max(0, raceDate.getTime() - Date.now())
  countdown.value = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000)
  }
}

onMounted(() => { updateCountdown(); interval = setInterval(updateCountdown, 1000) })
onUnmounted(() => clearInterval(interval))

// Normalize circuit names to SVG filenames
function normalizeCircuitName(name: string | undefined): string {
  if (!name) return ''
  const circuitMap: Record<string, string> = {
    'bahrain international circuit': 'bahrain',
    'jeddah corniche circuit': 'jeddah',
    'miami international autodrome': 'miami',
    'circuit de monaco': 'monaco',
    'circuit de barcelona-catalunya': 'barcelona',
    'red bull ring': 'austria',
    'silverstone circuit': 'silverstone',
    'hungaroring': 'hungary',
    'spa-francorchamps': 'spa',
    'autodromo di monza': 'monza',
    'marina bay street circuit': 'singapore',
    'suzuka circuit': 'suzuka',
    'lusail international circuit': 'qatar',
    'circuit of the americas': 'austin',
    'autodromo hermanos rodriguez': 'mexico-city',
    'autodromo jose maria guizado': 'sao-paulo',
    'yas marina circuit': 'abu-dhabi'
  }
  const normalized = name.toLowerCase().trim()
  if (circuitMap[normalized]) {
    return circuitMap[normalized]
  }
  const firstWord = normalized.split(/\s+/)[0]
  const partial = Object.entries(circuitMap).find(([key]) =>
    key.split(/\s+/)[0] === firstWord
  )
  if (partial) {
    return partial[1]
  }
  return firstWord || normalized.replace(/\s+/g, '-')
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Next Race Hero -->
      <div class="lg:col-span-2 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] overflow-hidden">
        <div v-if="nextRace" class="p-6">
          <div class="h-[2px] w-full bg-gradient-to-r from-[#e10600] to-transparent -mt-6 mb-6 -mx-6"
               style="width: calc(100% + 3rem)" />

          <!-- Layout: Texto a la izquierda, circuito a la derecha -->
          <div class="flex items-start justify-between gap-6">
            <!-- Texto + countdown -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-widest mb-2">
                <span>Next Race</span>
                <span class="font-timing bg-[#141414] px-2 py-0.5 rounded">R{{ nextRace.round }}</span>
              </div>

              <h2 class="text-3xl font-bold text-[#f0f0f0] tracking-tight mb-1">
                {{ getCountryFlag(nextRace.country || '') }} {{ nextRace.raceName }}
              </h2>
              <p class="text-sm text-[#8a8a8a]">{{ nextRace.circuitName }}</p>
              <p class="text-xs text-[#444]">{{ nextRace.locality }}, {{ nextRace.country }}</p>

              <!-- Countdown -->
              <div class="grid grid-cols-4 gap-3 max-w-sm mt-6">
            <!-- Days -->
            <div class="text-center">
              <div class="font-timing text-3xl font-bold text-[#f0f0f0]">
                {{ String(countdown.days).padStart(2, '0') }}
              </div>
              <div class="text-[10px] text-[#444] uppercase tracking-wider mt-1">Days</div>
            </div>

            <!-- Hours -->
            <div class="text-center">
              <div class="font-timing text-3xl font-bold text-[#f0f0f0]">
                {{ String(countdown.hours).padStart(2, '0') }}
              </div>
              <div class="text-[10px] text-[#444] uppercase tracking-wider mt-1">Hrs</div>
            </div>

            <!-- Minutes -->
            <div class="text-center">
              <div class="font-timing text-3xl font-bold text-[#f0f0f0]">
                {{ String(countdown.minutes).padStart(2, '0') }}
              </div>
              <div class="text-[10px] text-[#444] uppercase tracking-wider mt-1">Min</div>
            </div>

            <!-- Seconds with transition -->
            <div class="text-center">
              <transition name="tick" mode="out-in">
                <div :key="countdown.seconds" class="font-timing text-3xl font-bold text-[#f0f0f0]">
                  {{ String(countdown.seconds).padStart(2, '0') }}
                </div>
              </transition>
              <div class="text-[10px] text-[#444] uppercase tracking-wider mt-1">Secs</div>
            </div>
              </div>

              <div class="mt-4 text-[10px] text-[#2a2a2a]">
                {{ new Date(nextRace.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </div>
            </div>

            <!-- Circuito compacto a la derecha -->
            <div class="shrink-0 flex flex-col items-center gap-2 w-[100px]">
              <div class="bg-[#0a0a0a] rounded-lg p-2 w-full flex items-center justify-center h-[90px]">
                <img
                  :src="`/tracks/svg/${normalizeCircuitName(nextRace.circuitName)}.svg`"
                  :alt="nextRace.circuitName"
                  class="w-[74px] h-[74px] object-contain circuit-svg"
                />
              </div>
              <p class="text-[9px] text-[#444] text-center uppercase tracking-wider leading-tight">
                {{ nextRace.country }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="p-6 text-[#444] text-sm">Loading data...</div>
      </div>

      <!-- Mini Standings -->
      <div class="space-y-4">
        <!-- Drivers -->
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] text-[#444] uppercase tracking-widest font-medium">Drivers Championship</span>
            <NuxtLink to="/standings/drivers" class="text-[10px] text-[#e10600] hover:text-[#ff3333]">View all</NuxtLink>
          </div>
          <div v-if="topDrivers.length" class="space-y-2 max-h-96 overflow-y-auto">
            <div v-for="d in topDrivers" :key="d.driverId" class="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-[#141414] transition-colors">
              <span class="font-timing w-4 text-right text-[#444]">{{ d.position }}</span>
              <span class="w-1 h-5 rounded-full" :style="{ backgroundColor: getTeamColor(d.constructorName || '') }" />
              <img
                :src="`/teams/logos/${getTeamLogo(d.constructorName || '')}.webp`"
                :alt="d.constructorName"
                class="w-4 h-4 object-contain"
              />
              <span class="flex-1 text-[#f0f0f0] font-medium">{{ d.familyName }}</span>
              <span class="font-timing text-[#8a8a8a]">{{ d.points }}</span>
            </div>
          </div>
          <p v-else class="text-[#2a2a2a] text-xs">Loading...</p>
        </div>

        <!-- Constructors -->
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] text-[#444] uppercase tracking-widest font-medium">Constructors</span>
            <NuxtLink to="/standings/constructors" class="text-[10px] text-[#e10600] hover:text-[#ff3333]">View all</NuxtLink>
          </div>
          <div v-if="topConstructors.length" class="space-y-2 max-h-96 overflow-y-auto">
            <div v-for="c in topConstructors" :key="c.constructorId" class="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-[#141414] transition-colors">
              <span class="font-timing w-4 text-right text-[#444]">{{ c.position }}</span>
              <span class="w-1 h-5 rounded-full" :style="{ backgroundColor: getTeamColor(c.constructorName) }" />
              <img
                :src="`/teams/logos/${getTeamLogo(c.constructorName)}.webp`"
                :alt="c.constructorName"
                class="w-4 h-4 object-contain"
              />
              <span class="flex-1 text-[#f0f0f0] font-medium">{{ c.constructorName.replace(/\s+F1\s+Team\s*$/i, '') }}</span>
              <span class="font-timing text-[#8a8a8a]">{{ c.points }}</span>
            </div>
          </div>
          <p v-else class="text-[#2a2a2a] text-xs">Loading...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Make SVG circuit visible: invert black stroke to red F1 color */
.circuit-svg {
  filter: invert(1) sepia(1) saturate(3) hue-rotate(320deg) brightness(0.9);
}
</style>
