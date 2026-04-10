<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'

const props = defineProps<{
  drivers: Array<{
    number: string
    tla: string
    teamName: string
    teamId: string
    inPit: boolean
    pitOut: boolean
    pitStops: number
    compound: string
    position: number
  }>
}>()

interface PitEvent {
  tla: string
  teamName: string
  number: string
  type: 'IN' | 'OUT'
  stops: number
  compound: string
  position: number
  time: number
}

const pitEvents = ref<PitEvent[]>([])
const prevState = ref<Record<string, { inPit: boolean; pitOut: boolean }>>({})

watch(() => props.drivers, (drivers) => {
  for (const d of drivers) {
    const prev = prevState.value[d.number]
    if (prev) {
      // Detect pit entry
      if (d.inPit && !prev.inPit) {
        pitEvents.value.unshift({
          tla: d.tla, teamName: d.teamName, number: d.number,
          type: 'IN', stops: d.pitStops, compound: d.compound,
          position: d.position, time: Date.now()
        })
      }
      // Detect pit exit
      if (d.pitOut && !prev.pitOut) {
        pitEvents.value.unshift({
          tla: d.tla, teamName: d.teamName, number: d.number,
          type: 'OUT', stops: d.pitStops, compound: d.compound,
          position: d.position, time: Date.now()
        })
      }
    }
    prevState.value[d.number] = { inPit: d.inPit, pitOut: d.pitOut }
  }
  // Keep last 20 events
  if (pitEvents.value.length > 20) pitEvents.value.length = 20
}, { deep: true })

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
}

// Update time display
const now = ref(Date.now())
let interval: ReturnType<typeof setInterval>
onMounted(() => { interval = setInterval(() => { now.value = Date.now() }, 5000) })
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
    <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Pit Stops</h3>
    <div class="space-y-1.5 max-h-[300px] overflow-y-auto">
      <div
        v-for="(evt, i) in pitEvents"
        :key="`${evt.number}-${evt.time}`"
        class="flex items-center gap-2 text-[11px] py-1.5 px-2 rounded-lg"
        :class="i === 0 ? 'bg-[#141414]' : ''"
      >
        <span
          class="font-timing text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0"
          :style="{
            color: getTeamColor(evt.teamName),
            backgroundColor: `${getTeamColor(evt.teamName)}15`
          }"
        >{{ evt.tla }}</span>
        <span
          class="text-[9px] font-bold px-1.5 rounded-sm shrink-0"
          :class="evt.type === 'IN'
            ? 'text-[#ffc906] bg-[#ffc906]/10'
            : 'text-[#00d25b] bg-[#00d25b]/10'"
        >
          {{ evt.type === 'IN' ? 'PIT IN' : 'PIT OUT' }}
        </span>
        <span v-if="evt.type === 'OUT' && evt.compound" class="text-[10px] text-[#555]">
          → {{ evt.compound }}
        </span>
        <span class="flex-1" />
        <span class="font-timing text-[10px] text-[#333]">P{{ evt.position }}</span>
        <span class="font-timing text-[9px] text-[#333]">{{ timeAgo(evt.time) }}</span>
      </div>
      <p v-if="!pitEvents.length" class="text-[#333] text-xs text-center py-4">No pit activity yet</p>
    </div>
  </div>
</template>
