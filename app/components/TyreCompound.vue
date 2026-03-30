<script setup lang="ts">
defineProps<{
  compound?: string
  size?: 'xs' | 'sm' | 'md'
}>()

const compoundColor = computed(() => {
  switch (props.compound?.toUpperCase()) {
    case 'SOFT': return '#FF0000'
    case 'MEDIUM': return '#FFD700'
    case 'HARD': return '#FFFFFF'
    case 'INTER': return '#008000'
    case 'WET': return '#0000FF'
    default: return '#444444'
  }
})

const compoundBg = computed(() => {
  switch (props.compound?.toUpperCase()) {
    case 'SOFT': return '#FF0000'
    case 'MEDIUM': return '#FFD700'
    case 'HARD': return '#FFFFFF'
    case 'INTER': return '#008000'
    case 'WET': return '#0000FF'
    default: return '#444444'
  }
})

const sizeClasses = {
  xs: 'w-4 h-4 text-[7px]',
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-8 h-8 text-[10px]'
}

const textColor = computed(() => {
  const comp = props.compound?.toUpperCase()
  return (comp === 'HARD' || comp === 'MEDIUM') ? '#000' : '#fff'
})
</script>

<template>
  <div
    v-if="compound"
    :class="sizeClasses[size || 'sm']"
    class="rounded flex items-center justify-center font-bold border border-[#1f1f1f]"
    :style="{ backgroundColor: compoundBg, color: textColor }"
    :title="compound"
  >
    {{ compound?.[0] }}
  </div>
</template>
