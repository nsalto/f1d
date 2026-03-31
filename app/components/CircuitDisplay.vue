<script setup lang="ts">
const props = defineProps<{
  circuitName?: string
  country?: string
  showMap?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: { container: 'min-h-[80px]', img: 'max-w-[72px] max-h-[72px]' },
    md: { container: 'min-h-[140px]', img: 'max-w-[120px] max-h-[120px]' },
    lg: { container: 'min-h-[260px]', img: 'max-w-[240px] max-h-[240px]' },
  }
  return sizes[props.size || 'md']
})

const circuitId = computed(() => {
  if (!props.circuitName) return ''

  // Map full circuit names to SVG file names
  const circuitMap: Record<string, string> = {
    'bahrain international circuit': 'bahrain',
    'jeddah corniche circuit': 'jeddah',
    'miami international autodrome': 'miami',
    'circuit de monaco': 'monaco',
    'circuit de barcelona-catalunya': 'barcelona',
    'red bull ring': 'austria',
    'silverstone circuit': 'silverstone',
    'hungaroring': 'hungary',
    'spa-francorchamps': 'spa',
    'autodromo di monza': 'monza',
    'marina bay street circuit': 'singapore',
    'suzuka circuit': 'suzuka',
    'lusail international circuit': 'qatar',
    'circuit of the americas': 'austin',
    'autodromo hermanos rodriguez': 'mexico-city',
    'autodromo jose maria guizado': 'sao-paulo',
    'yas marina circuit': 'abu-dhabi'
  }

  const normalized = props.circuitName.toLowerCase().trim()
  const mapped = circuitMap[normalized]

  if (mapped) {
    return mapped
  }

  // Fallback: just use the first word or simple normalization
  const fallback = normalized.split(/\s+/)[0]
  return fallback || normalized.replace(/\s+/g, '-')
})
</script>

<template>
  <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
    <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Circuito</h3>

    <!-- Circuit map/SVG -->
    <div v-if="showMap && circuitId" class="mb-4 bg-[#0a0a0a] rounded-lg p-3 flex items-center justify-center" :class="sizeClasses.container">
      <img
        :src="`/tracks/svg/${circuitId}.svg`"
        :alt="circuitName"
        class="w-full h-full object-contain circuit-svg"
        :class="sizeClasses.img"
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

<style scoped>
/* Make SVG circuit visible: invert black stroke to red F1 color */
.circuit-svg {
  filter: invert(1) sepia(1) saturate(3) hue-rotate(320deg) brightness(0.9);
}
</style>
