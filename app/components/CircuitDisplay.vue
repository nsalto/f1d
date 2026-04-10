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
    full: 'w-full min-h-[200px]'
  }
  return sizes[props.size || 'md']
})

const imgClasses = computed(() => {
  // For "full" size, constrain the image so strokes stay thin
  return props.size === 'full'
    ? 'max-w-[320px] max-h-[320px] w-full h-full object-contain circuit-svg mx-auto'
    : 'w-full h-full object-contain circuit-svg'
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      v-if="circuitId"
      :class="['flex items-center justify-center rounded-lg overflow-hidden p-4', sizeClasses]"
    >
      <img
        :src="`/tracks/svg/${circuitId}.svg`"
        :alt="circuitName ? `${circuitName} circuit layout` : 'Circuit layout'"
        width="200"
        height="200"
        :class="imgClasses"
      />
    </div>
    <div v-if="showLabel && circuitName" class="mt-2 text-center">
      <p class="text-sm font-bold text-[#f0f0f0]">{{ circuitName }}</p>
      <p v-if="country" class="text-[10px] text-[#8a8a8a]">{{ country }}</p>
    </div>
  </div>
</template>
