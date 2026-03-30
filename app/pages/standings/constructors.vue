<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'
import { getTeamIdByName } from '~/utils/drivers-2026'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: standings } = useFetch(`/api/standings/constructors/${currentSeason}`)
const maxPoints = computed(() => standings.value?.[0]?.points || 1)

function getTeamIdForConstructor(constructorName: string): string {
  // Try direct name match first
  const teamId = getTeamIdByName(constructorName)
  if (teamId) return teamId

  // Fallback: convert name to id format (some names may be different)
  return constructorName.toLowerCase().replace(/\s+/g, '-')
}
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <h1 class="text-lg font-bold text-[#f0f0f0]">Constructors {{ currentSeason }}</h1>
      <div class="flex gap-1">
        <NuxtLink to="/standings/drivers"
          class="text-[10px] font-bold px-2.5 py-1 rounded text-[#444] hover:text-[#8a8a8a]">Drivers</NuxtLink>
        <NuxtLink to="/standings/constructors"
          class="text-[10px] font-bold px-2.5 py-1 rounded bg-[#141414] text-[#f0f0f0]">Constructors</NuxtLink>
      </div>
    </div>

    <div v-if="standings?.length" class="space-y-2">
      <div v-for="c in standings" :key="c.constructorId"
        class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 flex items-center gap-4 hover:border-[#2a2a2a] transition-colors">
        <LivePositionBadge :position="c.position" size="lg" />
        <div class="w-1 h-10 rounded-full" :style="{ backgroundColor: getTeamColor(c.constructorName) }" />
        <img
          :src="`/teams/logos/${getTeamIdForConstructor(c.constructorName)}.webp`"
          :alt="c.constructorName"
          class="w-6 h-6 object-contain"
        />
        <div class="flex-1">
          <h3 class="text-base font-bold text-[#f0f0f0]">{{ c.constructorName }}</h3>
          <p class="text-[10px] text-[#444]">{{ c.wins }} wins</p>
        </div>
        <div class="flex items-center gap-3 w-64">
          <div class="flex-1 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700"
              :style="{ width: `${(c.points/maxPoints)*100}%`, backgroundColor: getTeamColor(c.constructorName) }" />
          </div>
          <span class="font-timing text-lg font-bold text-[#f0f0f0] w-12 text-right">{{ c.points }}</span>
        </div>
      </div>
    </div>
    <p v-else class="text-[#444] text-sm text-center py-12">Loading standings...</p>
  </div>
</template>
