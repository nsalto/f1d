<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'
import { getDriverPhoto } from '~/utils/drivers-2026'

definePageMeta({ layout: 'default' })

const { currentSeason } = useSeason()
const { data: allDrivers } = useFetch(`/api/standings/drivers/${currentSeason}`)

const route = useRoute()
const router = useRouter()

const driver1 = ref((route.query.d1 as string) || '')
const driver2 = ref((route.query.d2 as string) || '')

watch([driver1, driver2], ([d1, d2]) => {
  router.replace({ query: { ...route.query, ...(d1 ? { d1 } : {}), ...(d2 ? { d2 } : {}) } })
})

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
    <h1 class="text-xl font-bold text-[#f0f0f0] mb-4">Compare Drivers</h1>

    <!-- Selectors -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label for="driver1-select" class="sr-only">Driver 1</label>
        <select id="driver1-select" v-model="driver1" autocomplete="off"
          class="w-full bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm text-[#f0f0f0]
                 focus-visible:ring-2 focus-visible:ring-[#e10600] focus-visible:outline-none">
          <option value="" disabled>Driver 1</option>
          <option v-for="d in driverOptions" :key="d.value" :value="d.value">{{ d.label }} ({{ d.team }})</option>
        </select>
      </div>
      <div>
        <label for="driver2-select" class="sr-only">Driver 2</label>
        <select id="driver2-select" v-model="driver2" autocomplete="off"
          class="w-full bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm text-[#f0f0f0]
                 focus-visible:ring-2 focus-visible:ring-[#e10600] focus-visible:outline-none">
          <option value="" disabled>Driver 2</option>
          <option v-for="d in driverOptions" :key="d.value" :value="d.value">{{ d.label }} ({{ d.team }})</option>
        </select>
      </div>
    </div>

    <div v-if="d1 && d2" class="space-y-4">
      <!-- Driver cards with photos -->
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(d, idx) in [d1, d2]" :key="idx"
          class="card-glass card-glow rounded-2xl overflow-hidden relative">
          <div class="h-[3px]" :style="{ backgroundColor: getTeamColor(d.constructorName || '') }" />
          <div class="p-5 flex items-center gap-4">
            <!-- Driver photo -->
            <div class="relative shrink-0">
              <img
                v-if="getDriverPhoto(d.familyName)"
                :src="getDriverPhoto(d.familyName)"
                :alt="`${d.givenName} ${d.familyName}`"
                width="100"
                height="100"
                class="w-[100px] h-[100px] object-cover object-top rounded-xl"
                style="mask-image: linear-gradient(to bottom, black 70%, transparent 100%);"
              />
              <div v-else class="w-[100px] h-[100px] rounded-xl bg-[#141414] flex items-center justify-center">
                <span class="font-timing text-2xl text-[#333] font-black">{{ d.driverCode }}</span>
              </div>
              <div class="absolute -bottom-1 -right-1 corner-cut-sm px-2 py-0.5"
                :style="{ backgroundColor: getTeamColor(d.constructorName || '') }">
                <span class="font-timing text-[10px] font-black text-white">P{{ d.position }}</span>
              </div>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-xs text-[#555] font-medium">{{ d.givenName }}</p>
              <p class="text-xl font-black text-[#f0f0f0] truncate tracking-tight">{{ d.familyName }}</p>
              <p class="text-[10px] font-semibold mt-0.5" :style="{ color: getTeamColor(d.constructorName || '') }">
                {{ (d.constructorName || '').replace(/\s+F1\s+Team\s*$/i, '') }}
              </p>
              <div class="mt-2 flex items-baseline gap-1">
                <span class="font-timing text-3xl font-black text-[#f0f0f0]">{{ d.points }}</span>
                <span class="text-[10px] text-[#444] uppercase font-semibold">pts</span>
              </div>
            </div>
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
      <div class="w-16 h-16 rounded-full bg-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-git-compare-arrows" class="w-6 h-6 text-[#444]" aria-hidden="true" />
      </div>
      <h2 class="text-sm font-bold text-[#8a8a8a] mb-1">Compare Drivers</h2>
      <p class="text-xs text-[#444] max-w-sm mx-auto">
        Select two drivers from the dropdowns above to see a head-to-head comparison.
      </p>
    </div>
  </div>
</template>
