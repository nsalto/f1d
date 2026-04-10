<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'
import { getCountryFlag } from '~/utils/formatters'
import { getTeamIdByName, getDriverPhoto } from '~/utils/drivers-2026'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: standings } = useFetch(`/api/standings/drivers/${currentSeason}`)
const maxPoints = computed(() => standings.value?.[0]?.points || 1)
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div>
          <div class="text-[9px] text-[#e10600] uppercase tracking-[0.2em] font-bold mb-1">Season {{ currentSeason }}</div>
          <h1 class="text-2xl font-black text-[#f0f0f0] tracking-tight">Drivers Championship</h1>
        </div>
      </div>
      <div class="flex gap-1.5">
        <NuxtLink to="/standings/drivers"
          class="corner-cut-sm text-[10px] font-bold px-3 py-1.5 bg-[#e10600] text-white uppercase tracking-widest">
          Drivers
        </NuxtLink>
        <NuxtLink to="/standings/constructors"
          class="corner-cut-sm text-[10px] font-bold px-3 py-1.5 bg-[#141414] text-[#555] hover:text-[#f0f0f0] hover:bg-[#1f1f1f] transition-all uppercase tracking-widest">
          Constructors
        </NuxtLink>
      </div>
    </div>

    <div v-if="standings?.length" class="card-glass card-glow rounded-2xl overflow-hidden">
      <div class="accent-line-red w-full" />
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[#141414] text-[9px] text-[#333] uppercase tracking-[0.15em]"
              style="background: rgba(225,6,0,0.02);">
            <th class="px-4 py-3 text-left w-12">Pos</th>
            <th class="px-4 py-3 text-left">Driver</th>
            <th class="px-4 py-3 text-left">Team</th>
            <th class="px-4 py-3 text-center w-14">Wins</th>
            <th class="px-4 py-3 text-right w-52">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in standings"
            :key="d.driverId"
            class="table-row-epic border-b border-[#0d0d0d] cursor-pointer group"
          >
            <td class="px-4 py-3">
              <LivePositionBadge :position="d.position" size="sm"
                :class="{
                  'podium-p1': d.position === 1,
                  'podium-p2': d.position === 2,
                  'podium-p3': d.position === 3,
                }"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <img
                  v-if="getDriverPhoto(d.familyName)"
                  :src="getDriverPhoto(d.familyName)"
                  :alt="d.familyName"
                  width="32"
                  height="32"
                  loading="lazy"
                  class="w-8 h-8 rounded-lg object-cover object-top shrink-0"
                />
                <span v-else class="text-base leading-none shrink-0">{{ getCountryFlag(d.nationality || '') }}</span>
                <div class="flex flex-col leading-tight">
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-[#555] text-xs font-medium">{{ d.givenName }}</span>
                    <span class="text-[#f0f0f0] font-black text-sm tracking-tight group-hover:text-white transition-colors">{{ d.familyName }}</span>
                  </div>
                  <span class="font-timing text-[9px] text-[#333] uppercase tracking-wider">{{ d.driverCode }}</span>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="w-[3px] h-5 rounded-full"
                      :style="{ backgroundColor: getTeamColor(d.constructorName || '') }" />
                <img
                  :src="`/teams/logos/${getTeamIdByName(d.constructorName || '')}.webp`"
                  :alt="d.constructorName"
                  width="18"
                  height="18"
                  loading="lazy"
                  class="w-4.5 h-4.5 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span class="text-xs text-[#555] group-hover:text-[#8a8a8a] transition-colors font-medium">
                  {{ d.constructorName.replace(/\s+F1\s+Team\s*$/i, '') }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="font-timing text-xs"
                    :class="d.wins > 0 ? 'text-[#ffd700] font-bold' : 'text-[#333]'">
                {{ d.wins }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 justify-end">
                <!-- Points bar mejorada -->
                <div class="w-28 h-1.5 bg-[#0d0d0d] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :style="{
                      width: `${(d.points / maxPoints) * 100}%`,
                      backgroundColor: getTeamColor(d.constructorName || ''),
                      boxShadow: `0 0 6px ${getTeamColor(d.constructorName || '')}80`
                    }"
                  />
                </div>
                <span class="font-timing font-black text-sm text-[#f0f0f0] w-10 text-right tabular-nums">{{ d.points }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="card-glass rounded-2xl p-6">
      <SkeletonCard :lines="10" show-bar />
    </div>

    <!-- Points Progression Chart -->
    <div class="mt-6">
      <PointsChart :season="currentSeason" />
    </div>
  </div>
</template>
