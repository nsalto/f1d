<script setup lang="ts">
definePageMeta({ layout: 'default' })

const connected = ref(false)
const noSession = ref(false)
const sessionInfo = ref<any>(null)
const trackStatus = ref<any>(null)
const weatherData = ref<any>(null)
const lapCount = ref<any>(null)
const timingData = ref<any>(null)
const raceControlMessages = ref<any>(null)
const driverList = ref<any>(null)
const extrapolatedClock = ref<any>(null)

const sortedDrivers = computed(() => {
  if (!timingData.value?.Lines || !driverList.value) return []
  return Object.entries(timingData.value.Lines as Record<string, any>)
    .map(([num, data]: [string, any]) => {
      const driver = driverList.value?.[num] || {}
      return {
        number: num,
        position: parseInt(data.Position || '99'),
        tla: driver.Tla || num,
        teamColour: driver.TeamColour ? `#${driver.TeamColour}` : '#444',
        gap: data.GapToLeader || '',
        interval: data.IntervalToPositionAhead?.Value || '',
        catching: data.IntervalToPositionAhead?.Catching || false,
        lastLap: data.LastLapTime?.Value || '',
        lastLapFastest: data.LastLapTime?.OverallFastest || false,
        lastLapPersonal: data.LastLapTime?.PersonalFastest || false,
        bestLap: data.BestLapTime?.Value || '',
        inPit: data.InPit || false,
        pitOut: data.PitOut || false,
        pitStops: data.NumberOfPitStops || 0,
        retired: data.Retired || false,
        stopped: data.Stopped || false,
        sectors: data.Sectors || []
      }
    })
    .sort((a, b) => a.position - b.position)
})

const rcMessages = computed(() => {
  if (!raceControlMessages.value?.Messages) return []
  return Object.values(raceControlMessages.value.Messages as Record<string, any>)
    .sort((a: any, b: any) => new Date(b.Utc || 0).getTime() - new Date(a.Utc || 0).getTime())
    .slice(0, 25)
})

// Clock
const clockDisplay = ref('')
let clockInterval: ReturnType<typeof setInterval>

function updateClock() {
  if (!extrapolatedClock.value?.Remaining) { clockDisplay.value = ''; return }
  if (extrapolatedClock.value.Extrapolating) {
    const base = new Date(extrapolatedClock.value.Utc || Date.now())
    const parts = extrapolatedClock.value.Remaining.split(':').map(Number)
    let totalMs = parts.length === 3 ? (parts[0]*3600+parts[1]*60+parts[2])*1000 : (parts[0]*60+parts[1])*1000
    const left = Math.max(0, totalMs - (Date.now() - base.getTime()))
    clockDisplay.value = `${Math.floor(left/60000)}:${String(Math.floor((left%60000)/1000)).padStart(2,'0')}`
  } else {
    clockDisplay.value = extrapolatedClock.value.Remaining || ''
  }
}

// SSE
let eventSource: EventSource | null = null
function connect() {
  eventSource = new EventSource('/api/live/stream')
  eventSource.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'no-session') { noSession.value = true; connected.value = false; return }
      noSession.value = false; connected.value = true
      const d = msg.data
      if (d.sessionInfo) sessionInfo.value = d.sessionInfo
      if (d.trackStatus) trackStatus.value = d.trackStatus
      if (d.weatherData) weatherData.value = d.weatherData
      if (d.lapCount) lapCount.value = d.lapCount
      if (d.timingData) timingData.value = d.timingData
      if (d.raceControlMessages) raceControlMessages.value = d.raceControlMessages
      if (d.driverList) driverList.value = d.driverList
      if (d.extrapolatedClock) extrapolatedClock.value = d.extrapolatedClock
    } catch { /* ignore */ }
  }
  eventSource.onerror = () => { connected.value = false; eventSource?.close(); setTimeout(connect, 5000) }
}

onMounted(() => { connect(); clockInterval = setInterval(updateClock, 200) })
onUnmounted(() => { eventSource?.close(); clearInterval(clockInterval) })
</script>

<template>
  <div>
    <!-- Header bar -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-bold text-[#f0f0f0]">Live Timing</h1>
        <LiveTrackStatusBanner v-if="trackStatus?.Status" :status="trackStatus.Status" />
      </div>

      <div class="flex items-center gap-4">
        <div v-if="sessionInfo?.Meeting?.Name" class="text-xs text-[#8a8a8a]">
          {{ sessionInfo.Meeting.Name }} — {{ sessionInfo.Name }}
        </div>
        <div v-if="clockDisplay" class="font-timing text-xl font-bold text-[#f0f0f0]">{{ clockDisplay }}</div>
        <div v-if="lapCount?.CurrentLap" class="font-timing text-xs text-[#8a8a8a]">
          LAP <span class="text-[#f0f0f0] font-bold">{{ lapCount.CurrentLap }}</span>
          <span v-if="lapCount.TotalLaps">/{{ lapCount.TotalLaps }}</span>
        </div>
        <!-- Weather mini -->
        <div v-if="weatherData" class="hidden lg:flex gap-3 text-[10px] text-[#444]">
          <span v-if="weatherData.AirTemp">{{ weatherData.AirTemp }}°C</span>
          <span v-if="weatherData.TrackTemp">Track {{ weatherData.TrackTemp }}°C</span>
          <span v-if="weatherData.Rainfall === '1'" class="text-blue-400">RAIN</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" :class="connected ? 'bg-[#00d25b] animate-pulse' : 'bg-[#e10600]'" />
          <span class="text-[10px] font-bold tracking-wider" :class="connected ? 'text-[#00d25b]' : 'text-[#444]'">
            {{ connected ? 'LIVE' : 'OFF' }}
          </span>
        </div>
      </div>
    </div>

    <!-- No session -->
    <div v-if="noSession" class="text-center py-24">
      <div class="w-16 h-16 rounded-full bg-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-radio" class="w-6 h-6 text-[#444]" />
      </div>
      <h2 class="text-base font-bold text-[#8a8a8a] mb-1">No hay sesion activa</h2>
      <p class="text-xs text-[#444] max-w-sm mx-auto">
        Se conecta automaticamente cuando hay Practice, Qualifying o Carrera.
      </p>
    </div>

    <!-- Live content -->
    <div v-else-if="connected" class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- Timing tower -->
      <div class="lg:col-span-3 rounded-xl bg-[#0a0a0a] border border-[#141414] overflow-hidden">
        <!-- Header -->
        <div class="grid items-center gap-2 px-3 py-2 border-b border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider font-medium"
             style="grid-template-columns: 2rem 3px 3rem 1fr 5rem 5rem 6rem auto 2.5rem">
          <span class="text-center">P</span>
          <span />
          <span>TLA</span>
          <span class="hidden md:block">Sectors</span>
          <span class="text-right">INT</span>
          <span class="text-right">GAP</span>
          <span class="text-right">LAST</span>
          <span class="text-right">BEST</span>
          <span class="text-center">PIT</span>
        </div>

        <!-- Rows -->
        <div
          v-for="d in sortedDrivers"
          :key="d.number"
          class="grid items-center gap-2 px-3 py-1.5 border-b border-[#0f0f0f] hover:bg-[#0f0f0f] transition-colors"
          :class="{ 'opacity-30': d.retired || d.stopped }"
          style="grid-template-columns: 2rem 3px 3rem 1fr 5rem 5rem 6rem auto 2.5rem"
        >
          <!-- Position -->
          <LivePositionBadge :position="d.position" size="sm" />

          <!-- Team color bar -->
          <div class="h-full w-[3px] rounded-full" :style="{ backgroundColor: d.teamColour }" />

          <!-- TLA -->
          <div class="flex items-center gap-1">
            <span class="text-xs font-bold text-[#f0f0f0] tracking-wider">{{ d.tla }}</span>
          </div>

          <!-- Mini sectors -->
          <div class="hidden md:block">
            <LiveMiniSectors :sectors="d.sectors" compact />
          </div>

          <!-- Interval -->
          <span class="font-timing text-xs text-right"
            :class="d.catching ? 'text-[#00d25b]' : 'text-[#8a8a8a]'">
            {{ d.position === 1 ? '' : d.interval }}
          </span>

          <!-- Gap -->
          <span class="font-timing text-xs text-right text-[#444]">
            {{ d.position === 1 ? 'LEADER' : d.gap }}
          </span>

          <!-- Last lap -->
          <span class="font-timing text-xs text-right font-medium"
            :class="{
              'text-[#9f00ff]': d.lastLapFastest,
              'text-[#00d25b]': d.lastLapPersonal && !d.lastLapFastest,
              'text-[#f0f0f0]': !d.lastLapFastest && !d.lastLapPersonal
            }">
            {{ d.lastLap }}
          </span>

          <!-- Best lap -->
          <span class="font-timing text-xs text-right text-[#444]">{{ d.bestLap }}</span>

          <!-- Pit -->
          <div class="text-center">
            <span v-if="d.inPit" class="text-[9px] font-bold text-[#ffc906] bg-[#ffc906]/10 px-1 rounded">PIT</span>
            <span v-else-if="d.pitOut" class="text-[9px] font-bold text-[#00d25b] bg-[#00d25b]/10 px-1 rounded">OUT</span>
            <span v-else-if="d.retired" class="text-[9px] font-bold text-[#e10600] bg-[#e10600]/10 px-1 rounded">RET</span>
            <span v-else class="font-timing text-[10px] text-[#2a2a2a]">{{ d.pitStops || '' }}</span>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Race Control -->
        <div class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Race Control</h3>
          <div class="space-y-2 max-h-[500px] overflow-y-auto">
            <div
              v-for="(msg, i) in rcMessages"
              :key="i"
              class="text-[11px] border-l-2 pl-2 py-1"
              :class="{
                'border-[#ffc906]': msg.Flag === 'YELLOW' || msg.Category === 'Flag',
                'border-[#e10600]': msg.Flag === 'RED',
                'border-[#00d25b]': msg.Flag === 'GREEN',
                'border-[#1f1f1f]': !msg.Flag
              }"
            >
              <p class="text-[#8a8a8a]">{{ msg.Message }}</p>
              <p class="text-[#2a2a2a] mt-0.5">
                {{ msg.Utc ? new Date(msg.Utc).toLocaleTimeString() : '' }}
                <span v-if="msg.Lap" class="ml-1">L{{ msg.Lap }}</span>
              </p>
            </div>
            <p v-if="!rcMessages.length" class="text-[#2a2a2a] text-xs">Sin mensajes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="text-center py-24">
      <div class="inline-block w-6 h-6 border-2 border-[#e10600] border-t-transparent rounded-full animate-spin mb-3" />
      <p class="text-xs text-[#444]">Conectando al live timing...</p>
    </div>
  </div>
</template>
