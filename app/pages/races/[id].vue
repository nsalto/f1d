<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'
import { getCountryFlag, getCompoundColor } from '~/utils/formatters'

definePageMeta({ layout: 'default' })

const route = useRoute()
const id = route.params.id as string
const [season, round] = id.split('-')
const toast = useToast()
const isDev = import.meta.dev

const { data: races } = useFetch(`/api/calendar/${season}`)
const race = computed(() => (races.value || []).find(r => r.round === Number(round)))
const { data: results } = useFetch(`/api/races/${season}/${round}/results`)
const { data: qualifying } = useFetch(`/api/races/${season}/${round}/qualifying`)
const { data: openf1Data } = useFetch('/api/openf1/race-data', { query: { season, round } })

const router = useRouter()

const activeTab = ref((route.query.tab as string) || 'results')

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } })
})

const syncing = ref(false)
async function syncRace() {
  if (!isDev) return
  syncing.value = true
  try {
    await $fetch('/api/sync/race', { method: 'POST', query: { season, round }, headers: { 'x-sync-secret': 'f1-dash-local-dev-key' } })
    toast.add({ title: 'Synced', color: 'success' })
    refreshNuxtData()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'error' }) }
  finally { syncing.value = false }
}

const tyreStrategy = computed(() => {
  if (!openf1Data.value?.stints?.length || !openf1Data.value?.drivers?.length) return []
  const driverMap = new Map<number, any>()
  for (const d of openf1Data.value.drivers) driverMap.set(d.driverNumber, d)
  const grouped = new Map<number, any[]>()
  for (const s of openf1Data.value.stints) {
    if (!grouped.has(s.driverNumber)) grouped.set(s.driverNumber, [])
    grouped.get(s.driverNumber)!.push(s)
  }
  return Array.from(grouped.entries()).map(([num, stints]) => ({
    driver: driverMap.get(num),
    stints: stints.sort((a: any, b: any) => a.stintNumber - b.stintNumber)
  }))
})

const maxLap = computed(() => {
  if (!openf1Data.value?.stints?.length) return 0
  return Math.max(...openf1Data.value.stints.map((s: any) => s.lapEnd || 0))
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-5">
      <NuxtLink to="/calendar" class="text-[10px] text-[#444] hover:text-[#8a8a8a] uppercase tracking-wider">
        &larr; Calendar
      </NuxtLink>

      <div class="flex items-center justify-between mt-2">
        <div>
          <h1 v-if="race" class="text-2xl font-bold text-[#f0f0f0] tracking-tight">
            {{ getCountryFlag(race.country || '') }} {{ race.raceName }}
          </h1>
          <h1 v-else class="text-2xl font-bold text-[#f0f0f0]">Round {{ round }}</h1>
          <p v-if="race" class="text-xs text-[#8a8a8a] mt-0.5">
            {{ race.circuitName }} | {{ new Date(race.date).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </p>
        </div>
        <UButton v-if="isDev" icon="i-lucide-refresh-cw" variant="outline" color="neutral" size="xs" :loading="syncing" @click="syncRace">Sync</UButton>
      </div>
    </div>

    <!-- Tabs -->
    <div role="tablist" class="flex gap-1 mb-5">
      <button
        v-for="tab in [
          { id: 'results', label: 'Race' },
          { id: 'qualifying', label: 'Qualifying' },
          { id: 'strategy', label: 'Strategy' },
          { id: 'pitstops', label: 'Pit Stops' }
        ]"
        :key="tab.id"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`tabpanel-${tab.id}`"
        :class="[
          'px-3 py-1.5 rounded text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#e10600] focus-visible:outline-none',
          activeTab === tab.id ? 'bg-[#141414] text-[#f0f0f0]' : 'text-[#444] hover:text-[#8a8a8a]'
        ]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Race Results -->
    <div v-if="activeTab === 'results'">
      <div v-if="results?.length" class="rounded-xl bg-[#0a0a0a] border border-[#141414] overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider">
              <th class="px-3 py-2 text-left w-10">Pos</th>
              <th class="px-3 py-2 text-left">Driver</th>
              <th class="px-3 py-2 text-left">Team</th>
              <th class="px-3 py-2 text-center">Grid</th>
              <th class="px-3 py-2 text-right">Time</th>
              <th class="px-3 py-2 text-center">Pts</th>
              <th class="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.driverId" class="border-b border-[#0f0f0f] hover:bg-[#0f0f0f] transition-colors">
              <td class="px-3 py-1.5"><LivePositionBadge :position="r.position || 99" size="sm" /></td>
              <td class="px-3 py-1.5">
                <span class="text-[#8a8a8a] text-xs">{{ r.givenName }} </span>
                <span class="text-[#f0f0f0] text-xs font-bold">{{ r.familyName }}</span>
              </td>
              <td class="px-3 py-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-[3px] h-4 rounded-full" :style="{ backgroundColor: getTeamColor(r.constructorName || '') }" />
                  <span class="text-xs text-[#8a8a8a]">{{ r.constructorName }}</span>
                </div>
              </td>
              <td class="px-3 py-1.5 text-center font-timing text-xs text-[#444]">{{ r.grid }}</td>
              <td class="px-3 py-1.5 text-right font-timing text-xs text-[#8a8a8a]">{{ r.time || '-' }}</td>
              <td class="px-3 py-1.5 text-center font-timing text-xs" :class="r.points && r.points > 0 ? 'text-[#00d25b] font-bold' : 'text-[#2a2a2a]'">{{ r.points || 0 }}</td>
              <td class="px-3 py-1.5 text-[10px]" :class="r.status === 'Finished' ? 'text-[#2a2a2a]' : 'text-[#ffc906]'">{{ r.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-[#444] text-xs text-center py-12">Results not available yet\u2026</p>
    </div>

    <!-- Qualifying -->
    <div v-if="activeTab === 'qualifying'">
      <div v-if="qualifying?.length" class="rounded-xl bg-[#0a0a0a] border border-[#141414] overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider">
              <th class="px-3 py-2 text-left w-10">Pos</th>
              <th class="px-3 py-2 text-left">Driver</th>
              <th class="px-3 py-2 text-left">Team</th>
              <th class="px-3 py-2 text-right">Q1</th>
              <th class="px-3 py-2 text-right">Q2</th>
              <th class="px-3 py-2 text-right">Q3</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in qualifying" :key="q.driverId" class="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
              <td class="px-3 py-1.5"><LivePositionBadge :position="q.position || 99" size="sm" /></td>
              <td class="px-3 py-1.5">
                <span class="text-[#8a8a8a] text-xs">{{ q.givenName }} </span>
                <span class="text-[#f0f0f0] text-xs font-bold">{{ q.familyName }}</span>
              </td>
              <td class="px-3 py-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-[3px] h-4 rounded-full" :style="{ backgroundColor: getTeamColor(q.constructorName || '') }" />
                  <span class="text-xs text-[#8a8a8a]">{{ q.constructorName }}</span>
                </div>
              </td>
              <td class="px-3 py-1.5 text-right font-timing text-xs text-[#8a8a8a]">{{ q.q1 || '-' }}</td>
              <td class="px-3 py-1.5 text-right font-timing text-xs text-[#8a8a8a]">{{ q.q2 || '-' }}</td>
              <td class="px-3 py-1.5 text-right font-timing text-xs" :class="q.position === 1 ? 'text-[#9f00ff] font-bold' : 'text-[#f0f0f0]'">{{ q.q3 || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-[#444] text-xs text-center py-12">Qualifying not available yet\u2026</p>
    </div>

    <!-- Tyre Strategy -->
    <div v-if="activeTab === 'strategy'">
      <div v-if="tyreStrategy.length" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 space-y-3">
        <div v-for="entry in tyreStrategy" :key="entry.driver?.driverNumber" class="flex items-center gap-3">
          <span class="w-10 font-timing text-[10px] text-[#444] text-right shrink-0">
            {{ entry.driver?.nameAcronym || entry.driver?.driverNumber }}
          </span>
          <span class="w-[3px] h-5 rounded-full shrink-0"
            :style="{ backgroundColor: entry.driver?.teamColour ? `#${entry.driver.teamColour}` : '#444' }" />
          <div class="flex-1 flex h-5 rounded overflow-hidden gap-[2px]">
            <div
              v-for="stint in entry.stints" :key="stint.stintNumber"
              class="h-full flex items-center justify-center text-[9px] font-bold rounded-[2px]"
              :style="{
                width: maxLap ? `${((stint.lapEnd - stint.lapStart + 1) / maxLap) * 100}%` : '0%',
                backgroundColor: getCompoundColor(stint.compound || ''),
                color: stint.compound === 'HARD' || stint.compound === 'MEDIUM' ? '#000' : '#fff'
              }"
              :title="`${stint.compound}: L${stint.lapStart}-${stint.lapEnd}`"
            >
              {{ stint.compound?.[0] }}
            </div>
          </div>
        </div>
        <!-- Legend -->
        <div class="flex gap-4 mt-3 pt-3 border-t border-[#141414]">
          <div v-for="c in ['SOFT','MEDIUM','HARD','INTER','WET']" :key="c" class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-[2px]" :style="{ backgroundColor: getCompoundColor(c) }" />
            <span class="text-[10px] text-[#444]">{{ c }}</span>
          </div>
        </div>
      </div>
      <p v-else class="text-[#444] text-xs text-center py-12">Strategy not available yet\u2026</p>
    </div>

    <!-- Pit Stops -->
    <div v-if="activeTab === 'pitstops'">
      <div v-if="openf1Data?.pitStops?.length" class="rounded-xl bg-[#0a0a0a] border border-[#141414] overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider">
              <th class="px-3 py-2 text-left">Driver</th>
              <th class="px-3 py-2 text-center">Lap</th>
              <th class="px-3 py-2 text-right">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pit, i) in openf1Data.pitStops" :key="i" class="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
              <td class="px-3 py-1.5 font-timing text-xs text-[#8a8a8a]">
                {{ openf1Data.drivers?.find((d: any) => d.driverNumber === pit.driverNumber)?.nameAcronym || `#${pit.driverNumber}` }}
              </td>
              <td class="px-3 py-1.5 text-center font-timing text-xs text-[#444]">{{ pit.lapNumber }}</td>
              <td class="px-3 py-1.5 text-right font-timing text-xs"
                :class="pit.pitDuration && pit.pitDuration < 25 ? 'text-[#00d25b]' : pit.pitDuration && pit.pitDuration > 30 ? 'text-[#ffc906]' : 'text-[#8a8a8a]'">
                {{ pit.pitDuration ? `${pit.pitDuration.toFixed(1)}s` : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-[#444] text-xs text-center py-12">Pit stops not available yet\u2026</p>
    </div>
  </div>
</template>
