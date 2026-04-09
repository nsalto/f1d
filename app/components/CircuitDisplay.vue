<script setup lang="ts">
import { normalizeCircuitName } from '~/utils/formatters'

const props = defineProps<{
  circuitName?: string
  country?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg' | 'full'
}>()

const circuitId = computed(() => normalizeCircuitName(props.circuitName))

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-[80px] h-[80px]',
    md: 'w-[140px] h-[140px]',
    lg: 'w-[200px] h-[200px]',
    full: 'w-full aspect-square'
  }
  return sizes[props.size || 'md']
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      v-if="circuitId"
      :class="['flex items-center justify-center bg-[#050505] rounded-lg overflow-hidden p-3', sizeClasses]"
    >
      <img
        :src="`/tracks/svg/${circuitId}.svg`"
        :alt="circuitName ? `${circuitName} circuit layout` : 'Circuit layout'"
        width="200"
        height="200"
        class="w-full h-full object-contain circuit-svg"
      />
    </div>
    <div v-if="showLabel && circuitName" class="mt-2 text-center">
      <p class="text-sm font-bold text-[#f0f0f0]">{{ circuitName }}</p>
      <p v-if="country" class="text-[10px] text-[#8a8a8a]">{{ country }}</p>
    </div>
  </div>
</template>
