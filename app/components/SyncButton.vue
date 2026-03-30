<script setup lang="ts">
const syncing = ref(false)
const toast = useToast()
const isDev = import.meta.dev

async function syncData() {
  if (!isDev) return
  syncing.value = true
  try {
    const result = await $fetch('/api/sync', {
      method: 'POST',
      headers: { 'x-sync-secret': 'f1-dash-local-dev-key' }
    })
    toast.add({ title: 'Sync completado', description: (result as any).results?.join(', '), color: 'success' })
    // Refresh page data
    refreshNuxtData()
  } catch (e: any) {
    toast.add({ title: 'Error sync', description: e.message, color: 'error' })
  } finally {
    syncing.value = false
  }
}
</script>

<template>
  <UButton
    v-if="isDev"
    icon="i-lucide-refresh-cw"
    variant="ghost"
    color="neutral"
    size="sm"
    :loading="syncing"
    @click="syncData"
  >
    Sync (dev)
  </UButton>
</template>
