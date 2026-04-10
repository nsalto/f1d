<script setup lang="ts">
import { getCountryFlag, normalizeCircuitName } from '~/utils/formatters'
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

</script>

<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Next Race Hero + Circuit -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Next Race Info -->
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] overflow-hidden relative">
          <div v-if="nextRace" class="p-6 relative z-10">
            <div class="h-[2px] w-full bg-gradient-to-r from-[#e10600] to-transparent -mt-6 mb-6 -mx-6"
                 style="width: calc(100% + 3rem)" />

            <div class="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-widest mb-2">
              <span>Next Race</span>
              <span class="font-timing bg-[#141414] px-2 py-0.5 rounded">R{{ nextRace.round }}</span>
            </div>

            <h2 class="text-2xl font-bold text-[#f0f0f0] tracking-tight mb-1 text-balance">
              {{ getCountryFlag(nextRace.country || '') }} {{ nextRace.raceName }}
            </h2>
            <p class="text-sm text-[#8a8a8a]">{{ nextRace.circuitName }}</p>
            <p class="text-xs text-[#444]">{{ nextRace.locality }}, {{ nextRace.country }}</p>

            <!-- Flip Countdown -->
            <div class="mt-5">
              <div class="grid grid-cols-4 gap-3 max-w-sm">
                <div v-for="unit in [
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hrs' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Sec' }
                ]" :key="unit.label" class="text-center">
                  <div class="flip-card relative bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
                    <div class="h-[1px] absolute top-1/2 left-0 right-0 bg-[#1f1f1f] z-10" />
                    <transition name="flip" mode="out-in">
                      <div :key="unit.value" class="font-timing text-3xl font-bold text-[#f0f0f0] py-3">
                        {{ String(unit.value).padStart(2, '0') }}
                      </div>
                    </transition>
                  </div>
                  <div class="text-[9px] text-[#444] uppercase tracking-wider mt-1.5 font-medium">{{ unit.label }}</div>
                </div>
              </div>
              <div class="mt-3 text-[10px] text-[#2a2a2a]">
                {{ new Date(nextRace.date).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </div>
            </div>

            <!-- Circuit background watermark -->
            <img
              v-if="nextRace.circuitName"
              :src="`/tracks/svg/${normalizeCircuitName(nextRace.circuitName)}.svg`"
              alt=""
              aria-hidden="true"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-[45%] h-[80%] object-contain opacity-[0.03] circuit-svg pointer-events-none"
            />
          </div>
          <div v-else class="p-6">
            <div class="animate-pulse space-y-4">
              <div class="h-2 bg-[#1a1a1a] rounded w-24" />
              <div class="h-6 bg-[#1a1a1a] rounded w-2/3" />
              <div class="h-3 bg-[#141414] rounded w-1/3" />
              <div class="grid grid-cols-4 gap-3 max-w-xs mt-4">
                <div v-for="i in 4" :key="i" class="text-center space-y-2">
                  <div class="h-8 bg-[#1a1a1a] rounded" />
                  <div class="h-2 bg-[#141414] rounded w-2/3 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Circuit Map Card -->
        <div v-if="nextRace" class="rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] p-5 overflow-hidden">
          <div class="h-[2px] w-full bg-gradient-to-r from-[#e10600] to-transparent -mt-5 mb-5 -mx-5"
               style="width: calc(100% + 2.5rem)" />
          <div class="flex items-center gap-2 mb-4">
            <span class="text-[10px] text-[#444] uppercase tracking-widest font-medium">Circuit</span>
            <span class="text-[10px] text-[#8a8a8a]">{{ nextRace.circuitName }}</span>
          </div>
          <div class="flex items-center justify-center bg-[#050505] rounded-lg p-6 min-h-[280px]">
            <CircuitDisplay :circuit-name="nextRace.circuitName" size="full" />
          </div>
        </div>
      </div>

      <!-- Mini Standings -->
      <div class="space-y-4">
        <!-- Drivers -->
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] text-[#444] uppercase tracking-widest font-medium">Drivers Championship</span>
            <NuxtLink to="/standings/drivers" class="text-[10px] text-[#e10600] hover:text-[#ff3333]">View all</NuxtLink>
          </div>
          <div v-if="topDrivers.length" class="space-y-1 max-h-96 overflow-y-auto">
            <div v-for="d in topDrivers" :key="d.driverId" class="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-[#141414] hover:border-l-2 hover:border-l-[#e10600] transition-colors duration-150 cursor-pointer">
              <span class="font-timing w-5 text-right text-[#8a8a8a]">{{ d.position }}</span>
              <span class="w-1 h-5 rounded-full" :style="{ backgroundColor: getTeamColor(d.constructorName || '') }" />
              <img
                :src="`/teams/logos/${getTeamIdByName(d.constructorName || '')}.webp`"
                :alt="d.constructorName"
                width="16"
                height="16"
                loading="lazy"
                class="w-4 h-4 object-contain"
              />
              <span class="flex-1 text-[#f0f0f0] font-medium truncate">{{ d.familyName }}</span>
              <span class="font-timing text-[#f0f0f0] ml-1 font-semibold">{{ d.points }}</span>
            </div>
          </div>
          <SkeletonCard v-else :lines="5" />
        </div>

        <!-- Constructors -->
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] text-[#444] uppercase tracking-widest font-medium">Constructors</span>
            <NuxtLink to="/standings/constructors" class="text-[10px] text-[#e10600] hover:text-[#ff3333]">View all</NuxtLink>
          </div>
          <div v-if="topConstructors.length" class="space-y-1 max-h-96 overflow-y-auto">
            <div v-for="c in topConstructors" :key="c.constructorId" class="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-[#141414] hover:border-l-2 hover:border-l-[#e10600] transition-colors duration-150 cursor-pointer">
              <span class="font-timing w-5 text-right text-[#8a8a8a]">{{ c.position }}</span>
              <span class="w-1 h-5 rounded-full" :style="{ backgroundColor: getTeamColor(c.constructorName) }" />
              <img
                :src="`/teams/logos/${getTeamIdByName(c.constructorName)}.webp`"
                :alt="c.constructorName"
                width="16"
                height="16"
                loading="lazy"
                class="w-4 h-4 object-contain"
              />
              <span class="flex-1 text-[#f0f0f0] font-medium truncate">{{ c.constructorName.replace(/\s+F1\s+Team\s*$/i, '') }}</span>
              <span class="font-timing text-[#f0f0f0] ml-1 font-semibold">{{ c.points }}</span>
            </div>
          </div>
          <SkeletonCard v-else :lines="5" />
        </div>
      </div>
    </div>
  </div>
</template>

