<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'
import { getTeamIdByName } from '~/utils/drivers-2026'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: standings } = useFetch(`/api/standings/constructors/${currentSeason}`)
const maxPoints = computed(() => standings.value?.[0]?.points || 1)
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <h1 class="text-xl font-bold text-[#f0f0f0]">Constructors {{ currentSeason }}</h1>
      <div class="flex gap-1">
        <NuxtLink to="/standings/drivers"
          class="text-[10px] font-bold px-2.5 py-1 rounded text-[#444] hover:text-[#8a8a8a]">Drivers</NuxtLink>
        <NuxtLink to="/standings/constructors"
          class="text-[10px] font-bold px-2.5 py-1 rounded bg-[#141414] text-[#f0f0f0]">Constructors</NuxtLink>
      </div>
    </div>

    <div v-if="standings?.length" class="space-y-2">
      <div v-for="c in standings" :key="c.constructorId"
        class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 flex items-center gap-4 hover:bg-[#141414] hover:border-[#2a2a2a] transition-colors duration-200 cursor-pointer">
        <LivePositionBadge :position="c.position" size="lg" />
        <div class="w-1 h-10 rounded-full transition-all" :style="{ backgroundColor: getTeamColor(c.constructorName) }" />
        <img
          :src="`/teams/logos/${getTeamIdByName(c.constructorName)}.webp`"
          :alt="c.constructorName"
          width="32"
          height="32"
          loading="lazy"
          class="w-8 h-8 object-contain"
        />
        <div class="flex-1">
          <h3 class="text-base font-bold text-[#f0f0f0]">{{ c.constructorName.replace(/\s+F1\s+Team\s*$/i, '') }}</h3>
          <p class="text-[10px] text-[#8a8a8a]">{{ c.wins }} wins</p>
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
    <div v-else class="space-y-2">
      <div v-for="i in 6" :key="i" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 animate-pulse">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-[#1a1a1a]" />
          <div class="w-1 h-10 rounded-full bg-[#1a1a1a]" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-[#1a1a1a] rounded w-1/3" />
            <div class="h-2 bg-[#141414] rounded w-1/5" />
          </div>
          <div class="w-48 h-2 bg-[#141414] rounded" />
          <div class="w-10 h-5 bg-[#1a1a1a] rounded" />
        </div>
      </div>
    </div>
  </div>
</template>
