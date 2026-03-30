<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: penaltyData, refresh } = useFetch('/api/penalties')

// Auto refresh every 30 seconds
let interval: ReturnType<typeof setInterval>
onMounted(() => { interval = setInterval(refresh, 30000) })
onUnmounted(() => clearInterval(interval))

function getFlagColor(msg: any): string {
  const text = (msg.message || '').toUpperCase()
  if (text.includes('PENALTY')) return 'border-[#e10600]'
  if (text.includes('INVESTIGATION')) return 'border-[#ff9500]'
  if (text.includes('WARNING') || text.includes('BLACK AND WHITE')) return 'border-[#ffc906]'
  if (text.includes('DELETED')) return 'border-[#8a8a8a]'
  return 'border-[#1f1f1f]'
}

function getTag(msg: any): { label: string; color: string } | null {
  const text = (msg.message || '').toUpperCase()
  if (text.includes('TIME PENALTY')) return { label: 'TIME PENALTY', color: 'text-[#e10600] bg-[#e10600]/10' }
  if (text.includes('GRID PENALTY')) return { label: 'GRID PENALTY', color: 'text-[#e10600] bg-[#e10600]/10' }
  if (text.includes('PENALTY')) return { label: 'PENALTY', color: 'text-[#e10600] bg-[#e10600]/10' }
  if (text.includes('UNDER INVESTIGATION')) return { label: 'INVESTIGATION', color: 'text-[#ff9500] bg-[#ff9500]/10' }
  if (text.includes('NO FURTHER ACTION')) return { label: 'NO ACTION', color: 'text-[#00d25b] bg-[#00d25b]/10' }
  if (text.includes('WARNING')) return { label: 'WARNING', color: 'text-[#ffc906] bg-[#ffc906]/10' }
  if (text.includes('BLACK AND WHITE')) return { label: 'B&W FLAG', color: 'text-[#ffc906] bg-[#ffc906]/10' }
  if (text.includes('DELETED')) return { label: 'LAP DELETED', color: 'text-[#8a8a8a] bg-[#8a8a8a]/10' }
  if (text.includes('NOTED')) return { label: 'NOTED', color: 'text-[#444] bg-[#444]/10' }
  return null
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-lg font-bold text-[#f0f0f0]">Penalties & Decisions</h1>
        <p class="text-xs text-[#444]">Race control messages, investigations and penalties</p>
      </div>
      <div v-if="penaltyData?.sessionActive" class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-[#00d25b] animate-pulse" />
        <span class="text-[10px] font-bold text-[#00d25b] tracking-wider">LIVE SESSION</span>
      </div>
    </div>

    <!-- Live penalties -->
    <div v-if="penaltyData?.live?.length" class="space-y-2">
      <div
        v-for="(msg, i) in penaltyData.live"
        :key="i"
        :class="[
          'rounded-xl bg-[#0f0f0f] border-l-4 p-4 transition-colors',
          getFlagColor(msg)
        ]"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1.5">
              <span v-if="getTag(msg)"
                :class="['text-[10px] font-bold px-2 py-0.5 rounded-full', getTag(msg)!.color]">
                {{ getTag(msg)!.label }}
              </span>
              <span v-if="msg.driver" class="font-timing text-[10px] text-[#444]">#{{ msg.driver }}</span>
              <span v-if="msg.lap" class="text-[10px] text-[#2a2a2a]">Lap {{ msg.lap }}</span>
            </div>
            <p class="text-sm text-[#f0f0f0]">{{ msg.message }}</p>
            <p class="text-[10px] text-[#444] mt-1">
              {{ msg.gp }} — {{ msg.session }}
              <span v-if="msg.utc" class="ml-2">{{ new Date(msg.utc).toLocaleTimeString() }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <div class="w-16 h-16 rounded-full bg-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-shield-alert" class="w-6 h-6 text-[#444]" />
      </div>
      <h2 class="text-sm font-bold text-[#8a8a8a] mb-1">No recent penalties</h2>
      <p class="text-xs text-[#444] max-w-sm mx-auto">
        Penalties and stewards' decisions appear here during active F1 sessions.
      </p>
    </div>
  </div>
</template>
