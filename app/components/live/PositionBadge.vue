<script setup lang="ts">
const props = defineProps<{ position: number; size?: 'sm' | 'md' | 'lg' }>()

const sizeClasses = computed(() => {
  const s = props.size || 'md'
  return { sm: 'w-5 h-5 text-[10px]', md: 'w-7 h-7 text-xs', lg: 'w-10 h-10 text-sm' }[s]
})

const styleClasses = computed(() => {
  if (props.position === 1) return 'bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30 podium-p1'
  if (props.position === 2) return 'bg-[#c0c0c0]/10 text-[#c0c0c0] border border-[#c0c0c0]/30 podium-p2'
  if (props.position === 3) return 'bg-[#cd7f32]/10 text-[#cd7f32] border border-[#cd7f32]/30 podium-p3'
  return 'bg-[#141414] text-[#4a4a4a] border border-[#1a1a1a]'
})
</script>

<template>
  <!-- corner-cut en lugar de rounded-full para P1/P2/P3, circular para el resto -->
  <div
    :class="[
      'flex items-center justify-center font-timing font-black flex-shrink-0 transition-all',
      sizeClasses,
      styleClasses,
      position <= 3 ? 'corner-cut-sm' : 'rounded-full'
    ]"
  >
    {{ position }}
  </div>
</template>
