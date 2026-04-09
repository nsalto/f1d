<script setup lang="ts">
import { getCountryFlag } from '~/utils/formatters'

defineProps<{
  round: number
  raceName: string
  country: string | null
  locality: string | null
  circuitName: string
  date: string
  time: string | null
  sprintDate: string | null
  status: 'completed' | 'next' | 'upcoming'
}>()
</script>

<template>
  <NuxtLink
    :to="`/races/${new Date(date).getFullYear()}-${round}`"
    :class="[
      'block relative rounded-xl border overflow-hidden transition-all group',
      status === 'next'
        ? 'bg-[#0f0f0f] border-[#e10600]/40 shadow-[0_0_20px_rgba(225,6,0,0.08)]'
        : status === 'completed'
          ? 'bg-[#0a0a0a] border-[#141414] opacity-60 hover:opacity-80'
          : 'bg-[#0f0f0f] border-[#1f1f1f] hover:border-[#2a2a2a]'
    ]"
  >
    <div v-if="status === 'next'" class="h-[2px] w-full bg-gradient-to-r from-[#e10600] to-transparent" />

    <div class="p-4">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="font-timing text-[10px] text-[#444] font-medium">R{{ round }}</span>
          <span v-if="status === 'next'"
            class="text-[10px] font-bold text-[#e10600] bg-[#e10600]/10 border border-[#e10600]/20 px-2 py-0.5 rounded-full">
            NEXT
          </span>
          <span v-if="sprintDate"
            class="text-[10px] font-bold text-[#ff9500] bg-[#ff9500]/10 border border-[#ff9500]/20 px-1.5 py-0.5 rounded-full">
            SPRINT
          </span>
        </div>
        <span class="text-xl">{{ getCountryFlag(country || '') }}</span>
      </div>

      <h3 class="text-sm font-bold text-[#f0f0f0] leading-tight mb-1 group-hover:text-white transition-colors">
        {{ raceName }}
      </h3>
      <p class="text-xs text-[#8a8a8a]">{{ circuitName }}</p>
      <p class="text-[10px] text-[#444]">{{ locality }}, {{ country }}</p>

      <div class="mt-3 pt-3 border-t border-[#141414] flex items-center justify-between">
        <span class="text-xs text-[#8a8a8a]">
          {{ new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'short' }) }}
        </span>
        <span v-if="time" class="font-timing text-[10px] text-[#444]">
          {{ time.replace(':00Z', '') }} UTC
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
