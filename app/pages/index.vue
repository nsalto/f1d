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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Next Race Hero + Circuit -->
      <div class="lg:col-span-2 space-y-5">

        <!-- ╔══════════════════════════════╗
             ║  NEXT RACE HERO CARD         ║
             ╚══════════════════════════════╝ -->
        <div class="card-glass card-hero-glow rounded-2xl overflow-hidden relative"
             style="background: linear-gradient(135deg, #0e0e0e 0%, #0a0a0a 60%, #0d0808 100%);">

          <!-- Línea roja superior con glow -->
          <div class="accent-line-red w-full" />

          <!-- Gradiente interno tipo broadcast -->
          <div class="absolute inset-0 pointer-events-none"
               style="background: radial-gradient(ellipse 70% 60% at 80% 50%, rgba(225,6,0,0.04) 0%, transparent 70%);"></div>

          <div v-if="nextRace" class="p-7 relative z-10">

            <!-- Header badge -->
            <div class="flex items-center gap-3 mb-5">
              <div class="live-indicator">
                <span class="text-[10px] font-bold text-[#e10600] uppercase tracking-[0.15em]">Next Race</span>
              </div>
              <div class="corner-cut-sm bg-[#e10600]/10 border border-[#e10600]/20 px-2.5 py-0.5">
                <span class="font-timing text-[10px] font-bold text-[#e10600] tracking-widest">R{{ nextRace.round }}</span>
              </div>
              <div class="flex-1 h-px bg-gradient-to-r from-[#e10600]/20 to-transparent" />
            </div>

            <!-- Race name — tipografía impactante -->
            <div class="mb-1">
              <span class="text-4xl mr-2">{{ getCountryFlag(nextRace.country || '') }}</span>
            </div>
            <h2 class="text-3xl font-black text-[#f0f0f0] tracking-tight leading-none mb-2"
                style="text-shadow: 0 2px 20px rgba(0,0,0,0.8);">
              {{ nextRace.raceName }}
            </h2>
            <p class="text-sm text-[#6a6a6a] font-medium mb-0.5">{{ nextRace.circuitName }}</p>
            <p class="text-xs text-[#3a3a3a] uppercase tracking-wider">{{ nextRace.locality }} · {{ nextRace.country }}</p>

            <!-- Countdown épico -->
            <div class="mt-7">
              <div class="text-[9px] text-[#333] uppercase tracking-[0.2em] mb-3 font-semibold">Race Starts In</div>
              <div class="grid grid-cols-4 gap-3 max-w-xs">
                <div v-for="unit in [
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hrs' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Sec' }
                ]" :key="unit.label" class="text-center">
                  <div class="countdown-unit">
                    <transition name="flip" mode="out-in">
                      <div :key="unit.value"
                           class="font-timing text-3xl font-black text-[#f0f0f0] py-3 px-1 flip-number-glow">
                        {{ String(unit.value).padStart(2, '0') }}
                      </div>
                    </transition>
                  </div>
                  <div class="text-[9px] text-[#3a3a3a] uppercase tracking-[0.15em] mt-2 font-bold">{{ unit.label }}</div>
                </div>
              </div>
              <!-- Fecha -->
              <div class="mt-4 flex items-center gap-2">
                <div class="w-3 h-px bg-[#e10600]/40" />
                <span class="text-[10px] text-[#444] capitalize font-medium">
                  {{ new Date(nextRace.date).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
                </span>
              </div>
            </div>

            <!-- Circuit watermark más visible -->
            <img
              v-if="nextRace.circuitName"
              :src="`/tracks/svg/${normalizeCircuitName(nextRace.circuitName)}.svg`"
              alt=""
              aria-hidden="true"
              class="absolute right-6 top-1/2 -translate-y-1/2 w-[42%] h-[78%] object-contain circuit-svg pointer-events-none"
              style="opacity: 0.055; filter: invert(1) sepia(1) saturate(3) hue-rotate(320deg) brightness(0.9);"
            />
          </div>

          <!-- Skeleton -->
          <div v-else class="p-7">
            <div class="animate-pulse space-y-5">
              <div class="h-2 bg-[#1a1a1a] rounded w-28" />
              <div class="h-8 bg-[#1a1a1a] rounded w-3/4" />
              <div class="h-3 bg-[#141414] rounded w-1/3" />
              <div class="grid grid-cols-4 gap-3 max-w-xs mt-5">
                <div v-for="i in 4" :key="i" class="space-y-2">
                  <div class="h-14 bg-[#141414] rounded-lg" />
                  <div class="h-2 bg-[#111] rounded w-2/3 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Circuit Map Card -->
        <div v-if="nextRace"
             class="card-glass card-glow rounded-2xl overflow-hidden"
             style="background: linear-gradient(135deg, #0c0c0c 0%, #090909 100%);">
          <div class="accent-line-red w-full" />
          <div class="p-5">
            <div class="flex items-center gap-3 mb-5">
              <span class="text-[10px] text-[#e10600] uppercase tracking-[0.2em] font-bold">Circuit</span>
              <div class="w-px h-3 bg-[#2a2a2a]" />
              <span class="text-xs text-[#4a4a4a] font-medium">{{ nextRace.circuitName }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-[#1f1f1f] to-transparent" />
            </div>
            <CircuitDisplay :circuit-name="nextRace.circuitName" size="full" />
          </div>
        </div>
      </div>

      <!-- ╔══════════════════════════════╗
           ║  MINI STANDINGS SIDEBAR      ║
           ╚══════════════════════════════╝ -->
      <div class="space-y-5">

        <!-- Drivers Championship -->
        <div class="card-glass card-glow rounded-2xl overflow-hidden">
          <div class="accent-line-red w-full" />
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] text-[#e10600] uppercase tracking-[0.2em] font-bold">Drivers</span>
              <NuxtLink to="/standings/drivers"
                class="text-[10px] text-[#444] hover:text-[#e10600] transition-colors uppercase tracking-wider font-medium">
                View all →
              </NuxtLink>
            </div>
            <div v-if="topDrivers.length" class="space-y-px">
              <div
                v-for="d in topDrivers"
                :key="d.driverId"
                class="table-row-epic flex items-center gap-2.5 text-xs px-2 py-2 rounded-lg cursor-pointer group"
              >
                <!-- Posición con color especial para top 3 -->
                <span class="font-timing w-5 text-right text-[#3a3a3a] font-bold shrink-0"
                      :class="{
                        'text-[#ffd700]': d.position === 1,
                        'text-[#c0c0c0]': d.position === 2,
                        'text-[#cd7f32]': d.position === 3
                      }">
                  {{ d.position }}
                </span>
                <!-- Team color bar -->
                <span class="w-0.5 h-5 rounded-full shrink-0"
                      :style="{ backgroundColor: getTeamColor(d.constructorName || '') }" />
                <img
                  :src="`/teams/logos/${getTeamIdByName(d.constructorName || '')}.webp`"
                  :alt="d.constructorName"
                  width="16"
                  height="16"
                  loading="lazy"
                  class="w-4 h-4 object-contain opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
                />
                <span class="flex-1 text-[#c0c0c0] font-semibold truncate group-hover:text-[#f0f0f0] transition-colors">
                  {{ d.familyName }}
                </span>
                <span class="font-timing text-[#f0f0f0] font-bold text-xs">{{ d.points }}</span>
              </div>
            </div>
            <SkeletonCard v-else :lines="5" />
          </div>
        </div>

        <!-- Constructors Championship -->
        <div class="card-glass card-glow rounded-2xl overflow-hidden">
          <div class="accent-line-red w-full" />
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] text-[#e10600] uppercase tracking-[0.2em] font-bold">Constructors</span>
              <NuxtLink to="/standings/constructors"
                class="text-[10px] text-[#444] hover:text-[#e10600] transition-colors uppercase tracking-wider font-medium">
                View all →
              </NuxtLink>
            </div>
            <div v-if="topConstructors.length" class="space-y-px">
              <div
                v-for="c in topConstructors"
                :key="c.constructorId"
                class="table-row-epic flex items-center gap-2.5 text-xs px-2 py-2 rounded-lg cursor-pointer group"
              >
                <span class="font-timing w-5 text-right text-[#3a3a3a] font-bold shrink-0"
                      :class="{
                        'text-[#ffd700]': c.position === 1,
                        'text-[#c0c0c0]': c.position === 2,
                        'text-[#cd7f32]': c.position === 3
                      }">
                  {{ c.position }}
                </span>
                <span class="w-0.5 h-5 rounded-full shrink-0"
                      :style="{ backgroundColor: getTeamColor(c.constructorName) }" />
                <img
                  :src="`/teams/logos/${getTeamIdByName(c.constructorName)}.webp`"
                  :alt="c.constructorName"
                  width="16"
                  height="16"
                  loading="lazy"
                  class="w-4 h-4 object-contain opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
                />
                <span class="flex-1 text-[#c0c0c0] font-semibold truncate group-hover:text-[#f0f0f0] transition-colors">
                  {{ c.constructorName.replace(/\s+F1\s+Team\s*$/i, '') }}
                </span>
                <span class="font-timing text-[#f0f0f0] font-bold text-xs">{{ c.points }}</span>
              </div>
            </div>
            <SkeletonCard v-else :lines="5" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

