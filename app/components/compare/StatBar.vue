<script setup lang="ts">
const props = defineProps<{
  label: string
  valueA: number
  valueB: number
  colorA: string
  colorB: string
  lowerIsBetter?: boolean
}>()

const total = computed(() => props.valueA + props.valueB || 1)
const pctA = computed(() => (props.valueA / total.value) * 100)
const winnerA = computed(() => props.valueA !== props.valueB && (props.lowerIsBetter ? props.valueA < props.valueB : props.valueA > props.valueB))
const winnerB = computed(() => props.valueA !== props.valueB && (props.lowerIsBetter ? props.valueB < props.valueA : props.valueB > props.valueA))
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex justify-between items-center">
      <span :class="['font-timing text-sm font-bold', winnerA ? 'text-[#f0f0f0]' : 'text-[#444]']">
        {{ valueA }}
      </span>
      <span class="text-[10px] text-[#444] uppercase tracking-wider font-medium">{{ label }}</span>
      <span :class="['font-timing text-sm font-bold', winnerB ? 'text-[#f0f0f0]' : 'text-[#444]']">
        {{ valueB }}
      </span>
    </div>
    <div class="flex h-1.5 rounded-full overflow-hidden gap-[2px]">
      <div
        class="h-full rounded-l-full transition-all duration-500"
        :style="{ width: `${pctA}%`, backgroundColor: colorA, opacity: winnerA ? 1 : 0.3 }"
      />
      <div
        class="h-full rounded-r-full transition-all duration-500"
        :style="{ width: `${100 - pctA}%`, backgroundColor: colorB, opacity: winnerB ? 1 : 0.3 }"
      />
    </div>
  </div>
</template>
