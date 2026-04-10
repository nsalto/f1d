<script setup lang="ts">
defineProps<{
  lines?: number
  showBar?: boolean
  showCircle?: boolean
}>()
</script>

<template>
  <div class="animate-pulse space-y-3">
    <div v-if="showCircle" class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-[#1a1a1a]" />
      <div class="flex-1 space-y-2">
        <div class="h-3 bg-[#1a1a1a] rounded w-3/4" />
        <div class="h-2 bg-[#141414] rounded w-1/2" />
      </div>
    </div>
    <template v-for="i in (lines || 4)" :key="i">
      <div class="flex items-center gap-3">
        <div class="w-5 h-5 rounded bg-[#1a1a1a] shrink-0" />
        <div class="w-1 h-5 rounded-full bg-[#1a1a1a] shrink-0" />
        <div class="flex-1 h-3 bg-[#1a1a1a] rounded" :style="{ width: `${70 + Math.random() * 30}%` }" />
        <div v-if="showBar" class="w-16 h-2 bg-[#141414] rounded" />
        <div class="w-8 h-3 bg-[#1a1a1a] rounded shrink-0" />
      </div>
    </template>
  </div>
</template>
