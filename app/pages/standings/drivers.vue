<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'
import { getCountryFlag } from '~/utils/formatters'
import { getTeamIdByName } from '~/utils/drivers-2026'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: standings } = useFetch(`/api/standings/drivers/${currentSeason}`)
const maxPoints = computed(() => standings.value?.[0]?.points || 1)
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <h1 class="text-lg font-bold text-[#f0f0f0]">Drivers {{ currentSeason }}</h1>
      <div class="flex gap-1">
        <NuxtLink to="/standings/drivers"
          class="text-[10px] font-bold px-2.5 py-1 rounded bg-[#141414] text-[#f0f0f0]">Drivers</NuxtLink>
        <NuxtLink to="/standings/constructors"
          class="text-[10px] font-bold px-2.5 py-1 rounded text-[#444] hover:text-[#8a8a8a]">Constructors</NuxtLink>
      </div>
    </div>

    <div v-if="standings?.length" class="rounded-xl bg-[#0a0a0a] border border-[#141414] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider">
            <th class="px-3 py-2 text-left w-10">Pos</th>
            <th class="px-3 py-2 text-left">Driver</th>
            <th class="px-3 py-2 text-left">Team</th>
            <th class="px-3 py-2 text-center w-14">Wins</th>
            <th class="px-3 py-2 text-right w-48">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in standings" :key="d.driverId"
            class="border-b border-[#0f0f0f] hover:bg-[#141414] hover:border-[#1f1f1f] transition-all duration-200 cursor-pointer">
            <td class="px-3 py-2">
              <LivePositionBadge :position="d.position" size="sm" />
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <span class="text-xs">{{ getCountryFlag(d.nationality || '') }}</span>
                <span class="text-[#8a8a8a] text-xs">{{ d.givenName }}</span>
                <span class="text-[#f0f0f0] font-bold text-xs">{{ d.familyName }}</span>
                <span class="font-timing text-[10px] text-[#2a2a2a]">{{ d.driverCode }}</span>
              </div>
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <span class="w-[3px] h-4 rounded-full transition-all" :style="{ backgroundColor: getTeamColor(d.constructorName || '') }" />
                <img
                  :src="`/teams/logos/${getTeamIdByName(d.constructorName || '')}.webp`"
                  :alt="d.constructorName"
                  width="16"
                  height="16"
                  loading="lazy"
                  class="w-4 h-4 object-contain"
                />
                <span class="text-xs text-[#8a8a8a]">{{ d.constructorName.replace(/\s+F1\s+Team\s*$/i, '') }}</span>
              </div>
            </td>
            <td class="px-3 py-2 text-center font-timing text-xs text-[#8a8a8a]">{{ d.wins }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2 justify-end">
                <div class="w-24 h-1.5 bg-[#0f0f0f] rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                    :style="{ width: `${(d.points/maxPoints)*100}%`, backgroundColor: getTeamColor(d.constructorName || '') }" />
                </div>
                <span class="font-timing font-bold text-xs text-[#f0f0f0] w-8 text-right">{{ d.points }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="rounded-xl bg-[#0a0a0a] border border-[#141414] p-4">
      <SkeletonCard :lines="10" show-bar />
    </div>

    <!-- Points Progression Chart -->
    <div class="mt-4">
      <PointsChart :season="currentSeason" />
    </div>
  </div>
</template>
