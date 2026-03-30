<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getTeamColor } from '~/utils/team-colors'
import LiveMiniSectors from './live/MiniSectors.vue'

const props = defineProps<{
  position?: number | string
  number?: string
  given: string
  family: string
  tla: string
  team: string
  teamId: string
  teamColor?: string
  gap?: string
  interval?: string
  lastLap?: string
  bestLap?: string
  lastLapFastest?: boolean
  lastLapPersonal?: boolean
  pitStops?: number
  compound?: string
  inPit?: boolean
  pitOut?: boolean
  retired?: boolean
  stopped?: boolean
  sectors?: Record<string, any> | any[]
  catching?: boolean
}>()

const teamColor = computed(() => {
  // If teamColor is the default gray, use team color instead
  if (props.teamColor === '#444' || !props.teamColor) {
    return getTeamColor(props.team)
  }
  return props.teamColor
})

const positionColor = computed(() => {
  const pos = Number(props.position)
  if (pos === 1) return '#FFD700'
  if (pos === 2) return '#C0C0C0'
  if (pos === 3) return '#CD7F32'
  return '#f0f0f0'
})

// Normalize sectors: convert Record to array for MiniSectors
const sectorsList = computed(() => {
  if (!props.sectors) return []
  if (Array.isArray(props.sectors)) return props.sectors
  return Object.values(props.sectors)
})

// Position change animation
const positionFlashClass = ref('')
const flashKey = ref(0)

watch(() => Number(props.position), (newPos, oldPos) => {
  if (oldPos == null || newPos === oldPos) return
  positionFlashClass.value = newPos < oldPos ? 'pos-gained' : 'pos-lost'
  flashKey.value++
  setTimeout(() => { positionFlashClass.value = '' }, 1300)
})

// Last lap change animation
const lapFlashKey = ref(0)
const lapFlashActive = ref(false)

watch(() => props.lastLap, (newVal, oldVal) => {
  if (oldVal && newVal && newVal !== oldVal) {
    lapFlashActive.value = true
    lapFlashKey.value++
    setTimeout(() => { lapFlashActive.value = false }, 900)
  }
})
</script>

<template>
  <tr
    :key="flashKey"
    class="border-b border-[#0f0f0f] hover:bg-[#0f0f0f] transition-colors"
    :class="[{ 'opacity-30': retired || stopped }, positionFlashClass]"
  >
    <!-- Position -->
    <td class="px-3 py-1.5 text-center">
      <span
        class="text-xs font-bold w-6 h-6 flex items-center justify-center rounded"
        :style="{ color: positionColor, backgroundColor: `${teamColor}15` }"
      >
        {{ position }}
      </span>
    </td>

    <!-- Team color bar -->
    <td class="px-0 py-1.5">
      <div class="w-1 h-6 rounded-full" :style="{ backgroundColor: teamColor }" />
    </td>

    <!-- Driver name + team logo -->
    <td class="px-3 py-1.5">
      <div class="flex items-center gap-2">
        <img
          :src="`/teams/logos/${teamId}.webp`"
          :alt="team"
          class="w-5 h-5 object-contain"
        />
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold text-[#f0f0f0] uppercase tracking-wider">{{ tla }}</span>
          <span class="text-[9px] text-[#5a5a5a] truncate">{{ given }} {{ family }}</span>
        </div>
      </div>
    </td>

    <!-- Interval -->
    <td
      class="px-3 py-1.5 font-timing text-xs text-right"
      :class="catching ? 'text-[#00d25b]' : 'text-[#8a8a8a]'"
    >
      {{ position === 1 ? '' : interval || gap }}
    </td>

    <!-- Gap -->
    <td class="px-3 py-1.5 font-timing text-xs text-right text-[#444]">
      {{ position === 1 ? 'LEADER' : gap }}
    </td>

    <!-- Last lap -->
    <td
      :key="lapFlashKey"
      class="px-3 py-1.5 font-timing text-xs text-right font-medium"
      :class="[
        {
          'data-updated': lapFlashActive,
          'text-[#9f00ff]': lastLapFastest,
          'text-[#00d25b]': lastLapPersonal && !lastLapFastest,
          'text-[#f0f0f0]': !lastLapFastest && !lastLapPersonal
        }
      ]"
    >
      {{ lastLap }}
    </td>

    <!-- Best lap -->
    <td class="px-3 py-1.5 font-timing text-xs text-right text-[#444]">{{ bestLap }}</td>

    <!-- Tyre + Pit -->
    <td class="px-3 py-1.5 text-center">
      <div class="flex items-center justify-center gap-2">
        <TyreCompound v-if="compound && !retired" :compound="compound" size="xs" />
        <span v-if="inPit" class="text-[9px] font-bold text-[#ffc906] bg-[#ffc906]/10 px-1 rounded">PIT</span>
        <span v-else-if="pitOut" class="text-[9px] font-bold text-[#00d25b] bg-[#00d25b]/10 px-1 rounded">OUT</span>
        <span v-else-if="retired" class="text-[9px] font-bold text-[#e10600] bg-[#e10600]/10 px-1 rounded">RET</span>
        <span v-else-if="pitStops" class="font-timing text-[10px] text-[#2a2a2a]">{{ pitStops }}</span>
      </div>
    </td>
  </tr>
  <tr v-if="sectorsList.length" class="border-b border-[#0f0f0f]">
    <td colspan="8" class="px-3 pb-1.5 pt-0">
      <LiveMiniSectors :sectors="sectorsList" :compact="true" />
    </td>
  </tr>
</template>
