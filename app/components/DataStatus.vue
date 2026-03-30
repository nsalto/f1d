<script setup lang="ts">
const { data: status } = useFetch('/api/status', { lazy: true })

const lastSyncLabel = computed(() => {
  if (!status.value?.lastSync) return 'Sin sync'
  const diff = Date.now() - new Date(status.value.lastSync).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
})
</script>

<template>
  <div v-if="status" class="flex items-center gap-1.5">
    <span class="w-1.5 h-1.5 rounded-full" :class="status.hasData ? 'bg-[#00d25b]' : 'bg-[#ffc906]'" />
    <span class="text-[10px] text-[#444]">{{ lastSyncLabel }}</span>
  </div>
</template>
