<script setup lang="ts">
import { getCountryFlag } from '~/utils/formatters'

const { data: nextRace } = useFetch('/api/races/next')

const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })

function updateCountdown() {
  if (!nextRace.value?.date) return
  const raceDate = new Date(`${nextRace.value.date}T${nextRace.value.time || '14:00:00Z'}`)
  const now = new Date()
  const diff = raceDate.getTime() - now.getTime()

  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

let interval: ReturnType<typeof setInterval>
onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div v-if="nextRace" class="rounded-xl bg-gradient-to-br from-red-950/40 to-zinc-900 border border-zinc-800 p-6">
    <div class="flex items-center gap-2 text-sm text-zinc-400 mb-1">
      <span>Proxima Carrera</span>
      <span class="text-xs bg-zinc-800 px-2 py-0.5 rounded">R{{ nextRace.round }}</span>
    </div>

    <h2 class="text-2xl font-bold text-zinc-100 mb-1">
      {{ getCountryFlag(nextRace.country || '') }} {{ nextRace.raceName }}
    </h2>

    <p class="text-sm text-zinc-400 mb-4">
      {{ nextRace.circuitName }} - {{ nextRace.locality }}, {{ nextRace.country }}
    </p>

    <!-- Countdown -->
    <div class="grid grid-cols-4 gap-3 max-w-md">
      <div v-for="(val, key) in countdown" :key="key" class="text-center">
        <div class="text-3xl font-bold font-mono-timing text-zinc-100">
          {{ String(val).padStart(2, '0') }}
        </div>
        <div class="text-xs text-zinc-500 uppercase mt-1">
          {{ key === 'days' ? 'Dias' : key === 'hours' ? 'Horas' : key === 'minutes' ? 'Min' : 'Seg' }}
        </div>
      </div>
    </div>

    <!-- Race date -->
    <div class="mt-4 text-sm text-zinc-500">
      {{ new Date(nextRace.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
      {{ nextRace.time ? ' - ' + nextRace.time.replace(':00Z', ' UTC') : '' }}
    </div>
  </div>

  <div v-else class="rounded-xl bg-zinc-900 border border-zinc-800 p-6 text-zinc-500">
    No hay datos de proxima carrera. Sincroniza primero.
  </div>
</template>
