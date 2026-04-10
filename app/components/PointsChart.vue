<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { getTeamColor } from '~/utils/team-colors'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  season: string
}>()

const { data: progression } = useFetch(`/api/standings/drivers/${props.season}/progression`, { lazy: true })

const chartData = computed(() => {
  if (!progression.value?.length) return null

  const maxRound = progression.value[0].points.filter((p: number | null) => p !== null).length
  const labels = Array.from({ length: maxRound }, (_, i) => `R${i + 1}`)

  const datasets = progression.value.map((d: any) => {
    const color = getTeamColor(d.constructorName)
    return {
      label: d.familyName,
      data: d.points.slice(0, maxRound),
      borderColor: color,
      backgroundColor: `${color}15`,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: color,
      tension: 0.3,
      spanGaps: true
    }
  })

  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#8a8a8a',
        font: { size: 10, family: 'JetBrains Mono' },
        boxWidth: 12,
        padding: 12
      }
    },
    tooltip: {
      backgroundColor: '#0f0f0f',
      borderColor: '#1f1f1f',
      borderWidth: 1,
      titleColor: '#f0f0f0',
      bodyColor: '#8a8a8a',
      titleFont: { size: 11, family: 'JetBrains Mono' },
      bodyFont: { size: 10, family: 'JetBrains Mono' },
      padding: 10,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      ticks: { color: '#444', font: { size: 9, family: 'JetBrains Mono' } },
      grid: { color: '#141414' },
      border: { color: '#1f1f1f' }
    },
    y: {
      ticks: { color: '#444', font: { size: 9, family: 'JetBrains Mono' } },
      grid: { color: '#141414' },
      border: { color: '#1f1f1f' }
    }
  }
}
</script>

<template>
  <div class="rounded-xl bg-[#0a0a0a] border border-[#141414] p-4">
    <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-4">Points Progression</h3>
    <div v-if="chartData" class="h-[320px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="h-[320px] flex items-center justify-center">
      <div class="animate-pulse space-y-2 w-full">
        <div class="h-[280px] bg-[#0f0f0f] rounded" />
        <div class="flex justify-center gap-4">
          <div v-for="i in 5" :key="i" class="h-2 bg-[#1a1a1a] rounded w-16" />
        </div>
      </div>
    </div>
  </div>
</template>
