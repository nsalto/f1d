<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: allDrivers } = useFetch(`/api/standings/drivers/${currentSeason}`)

const driver1 = ref('')
const driver2 = ref('')

const driverOptions = computed(() =>
  (allDrivers.value || []).map(d => ({
    label: `${d.givenName} ${d.familyName}`,
    value: d.driverId,
    code: d.driverCode,
    team: d.constructorName
  }))
)

const d1 = computed(() => allDrivers.value?.find(d => d.driverId === driver1.value))
const d2 = computed(() => allDrivers.value?.find(d => d.driverId === driver2.value))
</script>

<template>
  <div>
    <h1 class="text-lg font-bold text-[#f0f0f0] mb-4">Compare Drivers</h1>

    <!-- Selectors -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <select v-model="driver1"
        class="w-full bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm text-[#f0f0f0]
               focus:border-[#e10600] focus:outline-none">
        <option value="" disabled>Driver 1</option>
        <option v-for="d in driverOptions" :key="d.value" :value="d.value">{{ d.label }} ({{ d.team }})</option>
      </select>
      <select v-model="driver2"
        class="w-full bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm text-[#f0f0f0]
               focus:border-[#e10600] focus:outline-none">
        <option value="" disabled>Driver 2</option>
        <option v-for="d in driverOptions" :key="d.value" :value="d.value">{{ d.label }} ({{ d.team }})</option>
      </select>
    </div>

    <div v-if="d1 && d2" class="space-y-4">
      <!-- Driver cards -->
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] overflow-hidden">
          <div class="h-[3px]" :style="{ backgroundColor: getTeamColor(d1.constructorName || '') }" />
          <div class="p-4 text-center">
            <p class="text-xl font-bold text-[#f0f0f0]">{{ d1.givenName }} {{ d1.familyName }}</p>
            <p class="text-xs" :style="{ color: getTeamColor(d1.constructorName || '') }">{{ d1.constructorName }}</p>
            <p class="font-timing text-3xl font-bold text-[#f0f0f0] mt-2">{{ d1.points }}</p>
            <p class="text-[10px] text-[#444] uppercase">points</p>
          </div>
        </div>
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] overflow-hidden">
          <div class="h-[3px]" :style="{ backgroundColor: getTeamColor(d2.constructorName || '') }" />
          <div class="p-4 text-center">
            <p class="text-xl font-bold text-[#f0f0f0]">{{ d2.givenName }} {{ d2.familyName }}</p>
            <p class="text-xs" :style="{ color: getTeamColor(d2.constructorName || '') }">{{ d2.constructorName }}</p>
            <p class="font-timing text-3xl font-bold text-[#f0f0f0] mt-2">{{ d2.points }}</p>
            <p class="text-[10px] text-[#444] uppercase">points</p>
          </div>
        </div>
      </div>

      <!-- Stat bars -->
      <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-5 space-y-4">
        <CompareStatBar label="Points" :value-a="d1.points" :value-b="d2.points"
          :color-a="getTeamColor(d1.constructorName || '')" :color-b="getTeamColor(d2.constructorName || '')" />
        <CompareStatBar label="Wins" :value-a="d1.wins" :value-b="d2.wins"
          :color-a="getTeamColor(d1.constructorName || '')" :color-b="getTeamColor(d2.constructorName || '')" />
        <CompareStatBar label="Position" :value-a="d1.position" :value-b="d2.position"
          :color-a="getTeamColor(d1.constructorName || '')" :color-b="getTeamColor(d2.constructorName || '')" lower-is-better />
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-xs text-[#444]">Select two drivers to compare</p>
    </div>
  </div>
</template>
