<script setup lang="ts">
const props = defineProps<{ position: number; size?: 'sm' | 'md' | 'lg' }>()

const config = computed(() => {
  const s = props.size || 'md'
  const sizes = { sm: 'w-5 h-5 text-[10px]', md: 'w-7 h-7 text-xs', lg: 'w-10 h-10 text-base' }
  if (props.position === 1) return `${sizes[s]} bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30`
  if (props.position === 2) return `${sizes[s]} bg-[#c0c0c0]/10 text-[#c0c0c0] border border-[#c0c0c0]/30`
  if (props.position === 3) return `${sizes[s]} bg-[#cd7f32]/10 text-[#cd7f32] border border-[#cd7f32]/30`
  return `${sizes[s]} bg-[#1a1a1a] text-[#8a8a8a] border border-[#1f1f1f]`
})
</script>

<template>
  <div :class="['rounded-full flex items-center justify-center font-timing font-bold flex-shrink-0', config]">
    {{ position }}
  </div>
</template>
