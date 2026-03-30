<script setup lang="ts">
defineProps<{
  sectors: any[]
  compact?: boolean
}>()

function getSegmentColor(status: number): string {
  if (status === 2049) return 'bg-[#00d25b]'  // personal best - green
  if (status === 2051) return 'bg-[#9f00ff]'  // overall best - purple
  if (status === 2048) return 'bg-[#ffc906]'  // normal - yellow
  return 'bg-[#1a1a1a]'                        // not passed yet
}

function getSectorTimeColor(sector: any): string {
  if (sector?.OverallFastest) return 'text-[#9f00ff]'
  if (sector?.PersonalFastest) return 'text-[#00d25b]'
  if (sector?.Value) return 'text-[#ffc906]'
  return 'text-[#444]'
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      v-for="(sector, sIdx) in (sectors || [])"
      :key="sIdx"
      class="flex items-center gap-1"
    >
      <!-- Mini segment blocks -->
      <div v-if="sector?.Segments" class="flex gap-[2px]">
        <span
          v-for="(seg, segIdx) in sector.Segments"
          :key="segIdx"
          :class="[
            compact ? 'w-[4px] h-[12px]' : 'w-[5px] h-[16px]',
            'rounded-[1px] transition-colors duration-300',
            getSegmentColor(seg?.Status || 0)
          ]"
        />
      </div>
      <!-- Sector time -->
      <span
        v-if="sector?.Value && !compact"
        :class="['text-[10px] font-timing whitespace-nowrap', getSectorTimeColor(sector)]"
      >
        {{ sector.Value }}
      </span>
      <!-- Sector separator -->
      <div v-if="sIdx < (sectors?.length || 0) - 1 && !compact" class="w-px h-3 bg-[#1f1f1f] mx-0.5" />
    </div>
  </div>
</template>
