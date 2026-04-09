<script setup lang="ts">
const props = defineProps<{ status: string; message?: string }>()

const statusMap: Record<string, { label: string; color: string; bg: string; glow: string; dot: string }> = {
  '1': { label: 'GREEN FLAG', color: 'text-[#00d25b]', bg: 'bg-[#00d25b]/10', glow: 'shadow-[0_0_12px_rgba(0,210,91,0.3)]', dot: 'bg-[#00d25b]' },
  '2': { label: 'YELLOW FLAG', color: 'text-[#ffc906]', bg: 'bg-[#ffc906]/10', glow: 'shadow-[0_0_12px_rgba(255,201,6,0.3)]', dot: 'bg-[#ffc906]' },
  '4': { label: 'SAFETY CAR', color: 'text-[#ffc906]', bg: 'bg-[#ffc906]/10', glow: 'shadow-[0_0_12px_rgba(255,201,6,0.3)]', dot: 'bg-[#ffc906]' },
  '5': { label: 'RED FLAG', color: 'text-[#e10600]', bg: 'bg-[#e10600]/10', glow: 'shadow-[0_0_12px_rgba(225,6,0,0.4)]', dot: 'bg-[#e10600] animate-pulse' },
  '6': { label: 'VSC DEPLOYED', color: 'text-[#ff9500]', bg: 'bg-[#ff9500]/10', glow: 'shadow-[0_0_12px_rgba(255,149,0,0.3)]', dot: 'bg-[#ff9500]' },
  '7': { label: 'VSC ENDING', color: 'text-[#ff9500]', bg: 'bg-[#ff9500]/10', glow: 'shadow-[0_0_12px_rgba(255,149,0,0.3)]', dot: 'bg-[#ff9500]' },
}

const current = computed(() => statusMap[props.status] || {
  label: 'UNKNOWN', color: 'text-[#444]', bg: 'bg-[#1a1a1a]', glow: '', dot: 'bg-[#444]'
})
</script>

<template>
  <div
    role="status"
    aria-live="assertive"
    :class="['inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1f1f1f]', current.bg, current.glow]"
  >
    <span :class="['w-2 h-2 rounded-full flex-shrink-0', current.dot]" />
    <span :class="['text-xs font-bold tracking-widest', current.color]">{{ current.label }}</span>
    <span v-if="message" class="text-[10px] text-[#8a8a8a] ml-1">{{ message }}</span>
  </div>
</template>
