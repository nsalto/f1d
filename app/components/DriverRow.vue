<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'

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
</script>

<template>
  <tr class="border-b border-[#0f0f0f] hover:bg-[#0f0f0f] transition-colors" :class="{ 'opacity-30': retired || stopped }">
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
    <td class="px-3 py-1.5 font-timing text-xs text-right text-[#8a8a8a]">
      {{ position === 1 ? '' : interval || gap }}
    </td>

    <!-- Gap -->
    <td class="px-3 py-1.5 font-timing text-xs text-right text-[#444]">
      {{ position === 1 ? 'LEADER' : gap }}
    </td>

    <!-- Last lap -->
    <td
      class="px-3 py-1.5 font-timing text-xs text-right font-medium"
      :class="{
        'text-[#9f00ff]': lastLapFastest,
        'text-[#00d25b]': lastLapPersonal && !lastLapFastest,
        'text-[#f0f0f0]': !lastLapFastest && !lastLapPersonal
      }"
    >
      {{ lastLap }}
    </td>

    <!-- Best lap -->
    <td class="px-3 py-1.5 font-timing text-xs text-right text-[#444]">{{ bestLap }}</td>

    <!-- Tyre + Pit -->
    <td class="px-3 py-1.5 text-center flex items-center justify-center gap-2">
      <TyreCompound v-if="compound && !retired" :compound="compound" size="xs" />
      <span v-if="inPit" class="text-[9px] font-bold text-[#ffc906] bg-[#ffc906]/10 px-1 rounded">PIT</span>
      <span v-else-if="pitOut" class="text-[9px] font-bold text-[#00d25b] bg-[#00d25b]/10 px-1 rounded">OUT</span>
      <span v-else-if="retired" class="text-[9px] font-bold text-[#e10600] bg-[#e10600]/10 px-1 rounded">RET</span>
      <span v-else-if="pitStops" class="font-timing text-[10px] text-[#2a2a2a]">{{ pitStops }}</span>
    </td>
  </tr>
</template>
