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
    <h1 class="text-xl font-bold text-[#f0f0f0] mb-4">Calendar {{ currentSeason }}</h1>

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
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div v-for="i in 8" :key="i" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 animate-pulse">
        <div class="flex justify-between mb-3">
          <div class="h-3 bg-[#1a1a1a] rounded w-10" />
          <div class="w-6 h-6 bg-[#1a1a1a] rounded" />
        </div>
        <div class="space-y-2">
          <div class="h-4 bg-[#1a1a1a] rounded w-3/4" />
          <div class="h-3 bg-[#141414] rounded w-1/2" />
          <div class="h-2 bg-[#141414] rounded w-2/5" />
        </div>
        <div class="mt-3 pt-3 border-t border-[#141414] flex justify-between">
          <div class="h-3 bg-[#1a1a1a] rounded w-16" />
          <div class="h-3 bg-[#141414] rounded w-14" />
        </div>
      </div>
    </div>
  </div>
</template>
