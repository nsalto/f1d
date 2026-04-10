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
  tyreAge?: number
  inPit?: boolean
  pitOut?: boolean
  retired?: boolean
  stopped?: boolean
  sectors?: Record<string, any> | any[]
  catching?: boolean
  inBattle?: boolean
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

// Position change animation + arrow
const positionFlashClass = ref('')
const flashKey = ref(0)
const posArrow = ref<'up' | 'down' | null>(null)

watch(() => Number(props.position), (newPos, oldPos) => {
  if (oldPos == null || newPos === oldPos) return
  const gained = newPos < oldPos
  positionFlashClass.value = gained ? 'pos-gained' : 'pos-lost'
  posArrow.value = gained ? 'up' : 'down'
  flashKey.value++
  setTimeout(() => { positionFlashClass.value = '' }, 1300)
  setTimeout(() => { posArrow.value = null }, 4000)
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
    class="border-b border-[#0c0c0c] transition-all duration-150 group"
    :class="[
      { 'opacity-25': retired || stopped },
      positionFlashClass,
      inBattle ? 'battle-row' : 'hover:bg-[rgba(255,255,255,0.015)]'
    ]"
  >
    <!-- Position -->
    <td class="px-3 py-2 text-center">
      <div class="flex items-center gap-1">
        <div
          class="font-timing text-xs font-black w-6 h-6 flex items-center justify-center rounded"
          :class="position <= 3 ? 'corner-cut-sm' : 'rounded'"
          :style="{
            color: positionColor,
            backgroundColor: `${teamColor}18`,
            boxShadow: position <= 3 ? `0 0 8px ${positionColor}30` : 'none'
          }"
        >
          {{ position }}
        </div>
        <transition name="arrow-fade">
          <span v-if="posArrow === 'up'"   class="text-[8px] text-[#00d25b] font-bold" style="text-shadow: 0 0 6px #00d25b;">&#9650;</span>
          <span v-else-if="posArrow === 'down'" class="text-[8px] text-[#e10600] font-bold" style="text-shadow: 0 0 6px #e10600;">&#9660;</span>
        </transition>
      </div>
    </td>

    <!-- Team color bar — más ancha y con glow -->
    <td class="px-0 py-2">
      <div
        class="w-[3px] h-7 rounded-full"
        :style="{
          backgroundColor: teamColor,
          boxShadow: `0 0 6px ${teamColor}60`
        }"
      />
    </td>

    <!-- Driver name + team logo -->
    <td class="px-3 py-2">
      <div class="flex items-center gap-2">
        <img
          :src="`/teams/logos/${teamId}.webp`"
          :alt="team"
          width="20"
          height="20"
          loading="lazy"
          class="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
        />
        <div class="flex flex-col min-w-0 leading-tight">
          <span class="text-xs font-black text-[#e0e0e0] uppercase tracking-wider group-hover:text-white transition-colors">{{ tla }}</span>
          <span class="text-[9px] text-[#3a3a3a] truncate font-medium">{{ given }} {{ family }}</span>
        </div>
      </div>
    </td>

    <!-- Interval -->
    <td
      class="px-3 py-2 font-timing text-xs text-right font-semibold"
      :class="catching ? 'text-[#00d25b]' : 'text-[#6a6a6a]'"
      :style="catching ? 'text-shadow: 0 0 8px rgba(0,210,91,0.4)' : ''"
    >
      {{ position === 1 ? '' : interval || gap }}
    </td>

    <!-- Gap -->
    <td class="px-3 py-2 font-timing text-xs text-right text-[#333]">
      <span v-if="position === 1" class="text-[#e10600] font-bold text-[9px] uppercase tracking-wider">LEADER</span>
      <span v-else>{{ gap }}</span>
    </td>

    <!-- Last lap -->
    <td
      :key="lapFlashKey"
      class="px-3 py-2 font-timing text-xs text-right font-bold"
      :class="[
        {
          'data-updated': lapFlashActive,
          'text-[#9f00ff]': lastLapFastest,
          'text-[#00d25b]': lastLapPersonal && !lastLapFastest,
          'text-[#8a8a8a]': !lastLapFastest && !lastLapPersonal
        }
      ]"
      :style="lastLapFastest ? 'text-shadow: 0 0 10px rgba(159,0,255,0.5)' : lastLapPersonal ? 'text-shadow: 0 0 8px rgba(0,210,91,0.4)' : ''"
    >
      {{ lastLap }}
    </td>

    <!-- Best lap -->
    <td class="px-3 py-2 font-timing text-xs text-right text-[#2a2a2a] group-hover:text-[#3a3a3a] transition-colors">{{ bestLap }}</td>

    <!-- Tyre + Age + Pit -->
    <td class="px-3 py-2 text-center">
      <div class="flex items-center justify-center gap-1.5">
        <TyreCompound v-if="compound && !retired" :compound="compound" size="xs" />
        <span v-if="compound && !retired && tyreAge" class="font-timing text-[10px] text-[#555]">
          L{{ tyreAge }}
        </span>
        <span v-if="inPit"
              class="text-[9px] font-black text-[#ffc906] bg-[#ffc906]/10 border border-[#ffc906]/20 px-1.5 rounded-sm uppercase tracking-wider"
              style="text-shadow: 0 0 8px rgba(255,201,6,0.4);">PIT</span>
        <span v-else-if="pitOut"
              class="text-[9px] font-black text-[#00d25b] bg-[#00d25b]/10 border border-[#00d25b]/20 px-1.5 rounded-sm uppercase tracking-wider"
              style="text-shadow: 0 0 8px rgba(0,210,91,0.4);">OUT</span>
        <span v-else-if="retired"
              class="text-[9px] font-black text-[#e10600] bg-[#e10600]/10 border border-[#e10600]/20 px-1.5 rounded-sm uppercase tracking-wider">RET</span>
        <span v-if="pitStops && !inPit && !pitOut && !retired"
              class="font-timing text-[10px] text-[#333] border-l border-[#1a1a1a] pl-1.5 ml-0.5">
          {{ pitStops }}s
        </span>
      </div>
    </td>
  </tr>
  <tr v-if="sectorsList.length" class="border-b border-[#0c0c0c]">
    <td colspan="8" class="px-3 pb-2 pt-0">
      <LiveMiniSectors :sectors="sectorsList" :compact="true" />
    </td>
  </tr>
</template>
