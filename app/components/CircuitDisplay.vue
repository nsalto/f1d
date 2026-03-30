<script setup lang="ts">
defineProps<{
  circuitName?: string
  country?: string
  showMap?: boolean
}>()

const circuitId = computed(() => {
  if (!props.circuitName) return ''
  return props.circuitName.toLowerCase().replace(/\s+/g, '-')
})
</script>

<template>
  <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
    <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Circuito</h3>

    <!-- Circuit map/SVG -->
    <div v-if="showMap && circuitId" class="mb-4 bg-[#0a0a0a] rounded-lg p-3 flex items-center justify-center min-h-[140px]">
      <img
        :src="`/tracks/svg/${circuitId}.svg`"
        :alt="circuitName"
        class="w-full h-full max-w-[120px] max-h-[120px] object-contain"
      />
    </div>

    <!-- Circuit info -->
    <div class="space-y-2">
      <p v-if="circuitName" class="text-sm font-semibold text-[#f0f0f0]">
        {{ circuitName }}
      </p>
      <p v-if="country" class="text-[11px] text-[#8a8a8a]">
        {{ country }}
      </p>
    </div>
  </div>
</template>
