<script setup lang="ts">
import { getCountryFlag } from '~/utils/formatters'
import { getTeamColor } from '~/utils/team-colors'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: nextRace } = useFetch('/api/races/next')
const { data: drivers } = useFetch(`/api/standings/drivers/${currentSeason}`)
const { data: constructors } = useFetch(`/api/standings/constructors/${currentSeason}`)

const topDrivers = computed(() => (drivers.value || []).slice(0, 10))
const topConstructors = computed(() => (constructors.value || []).slice(0, 5))
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
      <!-- Next Race Hero -->
      <div class="lg:col-span-2 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] overflow-hidden">
        <div v-if="nextRace" class="p-6">
          <div class="h-[2px] w-full bg-gradient-to-r from-[#e10600] to-transparent -mt-6 mb-6 -mx-6"
               style="width: calc(100% + 3rem)" />

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
          <div v-if="topDrivers.length" class="space-y-1.5">
            <div v-for="d in topDrivers.slice(0, 5)" :key="d.driverId" class="flex items-center gap-2 text-xs">
              <span class="font-timing w-4 text-right text-[#444]">{{ d.position }}</span>
              <span class="w-[3px] h-4 rounded-full" :style="{ backgroundColor: getTeamColor(d.constructorName || '') }" />
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
          <div v-if="topConstructors.length" class="space-y-1.5">
            <div v-for="c in topConstructors" :key="c.constructorId" class="flex items-center gap-2 text-xs">
              <span class="font-timing w-4 text-right text-[#444]">{{ c.position }}</span>
              <span class="w-[3px] h-4 rounded-full" :style="{ backgroundColor: getTeamColor(c.constructorName) }" />
              <span class="flex-1 text-[#f0f0f0] font-medium">{{ c.constructorName }}</span>
              <span class="font-timing text-[#8a8a8a]">{{ c.points }}</span>
            </div>
          </div>
          <p v-else class="text-[#2a2a2a] text-xs">Loading...</p>
        </div>
      </div>
    </div>

    <!-- Driver standings bar chart -->
    <div v-if="topDrivers.length" class="mt-4 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
      <span class="text-[10px] text-[#444] uppercase tracking-widest font-medium">Season Points {{ currentSeason }}</span>
      <div class="mt-3 space-y-1">
        <div v-for="d in topDrivers" :key="d.driverId" class="flex items-center gap-2 group">
          <span class="font-timing text-[10px] text-[#444] w-4 text-right">{{ d.position }}</span>
          <span class="text-xs text-[#8a8a8a] w-12 truncate">{{ d.driverCode }}</span>
          <div class="flex-1 h-4 bg-[#0a0a0a] rounded overflow-hidden">
            <div
              class="h-full rounded transition-all duration-700 flex items-center px-1.5"
              :style="{
                width: `${(d.points / maxPoints) * 100}%`,
                backgroundColor: getTeamColor(d.constructorName || '')
              }"
            >
              <span class="font-timing text-[9px] font-bold text-black/70">{{ d.points }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
