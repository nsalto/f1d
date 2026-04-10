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
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] overflow-hidden">
          <div v-if="nextRace" class="p-6">
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

            <!-- Countdown -->
            <div class="mt-4">
              <div class="grid grid-cols-4 gap-3 max-w-xs">
                <div class="text-center">
                  <div class="font-timing text-2xl font-bold text-[#f0f0f0]">
                    {{ String(countdown.days).padStart(2, '0') }}
                  </div>
                  <div class="text-[9px] text-[#444] uppercase tracking-wider mt-1">Days</div>
                </div>
                <div class="text-center">
                  <div class="font-timing text-2xl font-bold text-[#f0f0f0]">
                    {{ String(countdown.hours).padStart(2, '0') }}
                  </div>
                  <div class="text-[9px] text-[#444] uppercase tracking-wider mt-1">Hrs</div>
                </div>
                <div class="text-center">
                  <div class="font-timing text-2xl font-bold text-[#f0f0f0]">
                    {{ String(countdown.minutes).padStart(2, '0') }}
                  </div>
                  <div class="text-[9px] text-[#444] uppercase tracking-wider mt-1">Min</div>
                </div>
                <div class="text-center">
                  <transition name="tick" mode="out-in">
                    <div :key="countdown.seconds" class="font-timing text-2xl font-bold text-[#f0f0f0]">
                      {{ String(countdown.seconds).padStart(2, '0') }}
                    </div>
                  </transition>
                  <div class="text-[9px] text-[#444] uppercase tracking-wider mt-1">Secs</div>
                </div>
              </div>
              <div class="mt-2 text-[10px] text-[#2a2a2a]">
                {{ new Date(nextRace.date).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </div>
            </div>
          </div>
          <div v-else class="p-6 text-[#444] text-sm">Loading data\u2026</div>
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
          <p v-else class="text-[#2a2a2a] text-xs">Loading\u2026</p>
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
          <p v-else class="text-[#2a2a2a] text-xs">Loading\u2026</p>
        </div>
      </div>
    </div>
  </div>
</template>

