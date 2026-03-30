<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'

defineProps<{
  teamId?: string
  teamName?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showText?: boolean
}>()

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
}
</script>

<template>
  <div class="flex items-center gap-2">
    <img
      v-if="teamId"
      :src="`/teams/logos/${teamId}.webp`"
      :alt="teamName"
      :class="sizeClasses[size || 'sm']"
      class="object-contain"
    />
    <span v-if="showText && teamName" class="text-xs font-semibold text-[#f0f0f0]">{{ teamName }}</span>
  </div>
</template>
