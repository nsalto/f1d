<script setup lang="ts">
import { getCountryFlag, normalizeCircuitName } from '~/utils/formatters'

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
      'block relative rounded-2xl overflow-hidden transition-all duration-300 group card-glass',
      status === 'next'
        ? 'race-card-next'
        : status === 'completed'
          ? 'opacity-50 hover:opacity-75'
          : 'card-glow'
    ]"
    :style="status === 'next'
      ? 'background: linear-gradient(135deg, #0e0e0e 0%, #0a0a0a 60%, #0d0808 100%);'
      : 'background: linear-gradient(135deg, #0c0c0c 0%, #090909 100%);'"
  >
    <!-- Red top accent — solo para NEXT -->
    <div v-if="status === 'next'" class="accent-line-red w-full" />
    <!-- Subtle accent para el resto -->
    <div v-else class="h-px w-full bg-gradient-to-r from-[#1f1f1f] to-transparent" />

    <!-- Gradiente interno NEXT -->
    <div v-if="status === 'next'"
         class="absolute inset-0 pointer-events-none"
         style="background: radial-gradient(ellipse 80% 60% at 80% 50%, rgba(225,6,0,0.04) 0%, transparent 70%);" />

    <!-- Circuit watermark -->
    <img
      v-if="circuitName"
      :src="`/tracks/svg/${normalizeCircuitName(circuitName)}.svg`"
      alt=""
      aria-hidden="true"
      class="absolute right-2 bottom-6 w-[38%] h-[48%] object-contain circuit-svg pointer-events-none transition-all duration-500 group-hover:opacity-[0.07]"
      :style="status === 'next' ? 'opacity: 0.07' : 'opacity: 0.035'"
    />

    <div class="p-4 relative z-10">
      <!-- Round + badges -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="font-timing text-[9px] text-[#333] font-bold uppercase tracking-wider">R{{ round }}</span>
          <div v-if="status === 'next'"
               class="corner-cut-sm bg-[#e10600] px-2 py-0.5"
               style="box-shadow: 0 0 10px rgba(225,6,0,0.4);">
            <span class="text-[9px] font-black text-white uppercase tracking-widest">NEXT</span>
          </div>
          <span v-if="sprintDate"
            class="text-[9px] font-bold text-[#ff9500] bg-[#ff9500]/10 border border-[#ff9500]/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            Sprint
          </span>
        </div>
        <span class="text-2xl transition-transform duration-300 group-hover:scale-110">{{ getCountryFlag(country || '') }}</span>
      </div>

      <h3 class="text-sm font-black text-[#d0d0d0] leading-tight mb-1 group-hover:text-white transition-colors tracking-tight">
        {{ raceName }}
      </h3>
      <p class="text-[11px] text-[#4a4a4a] font-medium mb-0.5">{{ circuitName }}</p>
      <p class="text-[9px] text-[#2a2a2a] uppercase tracking-wider">{{ locality }} · {{ country }}</p>

      <div class="mt-3 pt-3 border-t border-[#141414]/60 flex items-center justify-between">
        <span class="text-xs font-semibold"
              :class="status === 'next' ? 'text-[#e10600]' : 'text-[#555]'">
          {{ new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'short' }) }}
        </span>
        <span v-if="time" class="font-timing text-[9px] text-[#333] uppercase tracking-wider">
          {{ time.replace(':00Z', '') }} UTC
        </span>
        <!-- Checkered flag para completados -->
        <span v-if="status === 'completed'" class="text-xs text-[#2a2a2a]">🏁</span>
      </div>
    </div>
  </NuxtLink>
</template>
