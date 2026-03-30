<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: races } = useFetch(`/api/calendar/${currentSeason}`)

const today = new Date().toISOString().split('T')[0]

function getRaceStatus(date: string): 'completed' | 'next' | 'upcoming' {
  if (date < today) return 'completed'
  const upcoming = (races.value || []).find(r => r.date >= today)
  if (upcoming && upcoming.date === date) return 'next'
  return 'upcoming'
}
</script>

<template>
  <div>
    <h1 class="text-lg font-bold text-[#f0f0f0] mb-4">Calendario {{ currentSeason }}</h1>

    <div v-if="races?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <CalendarRaceCard
        v-for="race in races"
        :key="race.round"
        :round="race.round"
        :race-name="race.raceName"
        :country="race.country"
        :locality="race.locality"
        :circuit-name="race.circuitName"
        :date="race.date"
        :time="race.time"
        :sprint-date="race.sprintDate"
        :status="getRaceStatus(race.date)"
      />
    </div>
    <p v-else class="text-[#444] text-sm text-center py-12">Cargando calendario...</p>
  </div>
</template>
