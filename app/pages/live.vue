<script setup lang="ts">
definePageMeta({ layout: 'default' })

const connected = ref(false)
const noSession = ref(false)
const isHistory = ref(false)
const historyMessage = ref('')
const sessionInfo = ref<any>(null)
const trackStatus = ref<any>(null)
const weatherData = ref<any>(null)
const lapCount = ref<any>(null)
const timingData = ref<any>(null)
const raceControlMessages = ref<any>(null)
const driverList = ref<any>(null)
const extrapolatedClock = ref<any>(null)
const sessionStatus = ref<any>(null)
const sessionData = ref<any>(null)
const timingStats = ref<any>(null)
const timingAppData = ref<any>(null)
const championshipPrediction = ref<any>(null)

const sortedDrivers = computed(() => {
  if (!timingData.value?.Lines || !driverList.value) return []
  return Object.entries(timingData.value.Lines as Record<string, any>)
    .map(([num, data]: [string, any]) => {
      const driver = driverList.value?.[num] || {}
      // Try to extract team from driver data or use a mapping
      const teamId = driver.TeamId?.toLowerCase().replace(/\s+/g, '-') || ''
      return {
        number: num,
        position: parseInt(data.Position || '99'),
        tla: driver.Tla || num,
        broadcastName: driver.BroadcastName || driver.FullName || '',
        teamColour: driver.TeamColour ? `#${driver.TeamColour}` : '#444',
        teamId,
        teamName: driver.TeamName || '',
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

function primitiveEntries(obj: unknown, max = 10): { key: string; value: string }[] {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []
  return Object.entries(obj as Record<string, unknown>)
    .filter(([, v]) => v != null && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'))
    .slice(0, max)
    .map(([key, v]) => ({ key, value: String(v) }))
}

const sessionStatusRows = computed(() => primitiveEntries(sessionStatus.value, 14))

const sessionDataRows = computed(() => primitiveEntries(sessionData.value, 10))

const timingStatsRows = computed(() => primitiveEntries(timingStats.value, 10))

const timingAppDataRows = computed(() => primitiveEntries(timingAppData.value, 10))

const championshipRows = computed(() => primitiveEntries(championshipPrediction.value, 8))

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

// Load last race data for testing
async function loadHistory() {
  try {
    const res = await $fetch<any>('/api/live/history')
    if (res.type === 'history' && res.data) {
      isHistory.value = true
      historyMessage.value = res.message || 'Last race data'
      const d = res.data
      if (d.sessionInfo) sessionInfo.value = d.sessionInfo
      if (d.trackStatus) trackStatus.value = d.trackStatus
      if (d.weatherData) weatherData.value = d.weatherData
      if (d.lapCount) lapCount.value = d.lapCount
      if (d.timingData) timingData.value = d.timingData
      if (d.raceControlMessages) raceControlMessages.value = d.raceControlMessages
      if (d.driverList) driverList.value = d.driverList
      if (d.extrapolatedClock) extrapolatedClock.value = d.extrapolatedClock
      if (d.sessionStatus) sessionStatus.value = d.sessionStatus
      if (d.sessionData) sessionData.value = d.sessionData
      if (d.timingStats) timingStats.value = d.timingStats
      if (d.timingAppData) timingAppData.value = d.timingAppData
      if (d.championshipPrediction) championshipPrediction.value = d.championshipPrediction
      connected.value = true
      noSession.value = false
    }
  } catch (error) {
    console.error('Error loading history:', error)
  }
}

// SSE
let eventSource: EventSource | null = null
function connect() {
  eventSource = new EventSource('/api/live/stream')
  eventSource.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'no-session') { noSession.value = true; connected.value = false; isHistory.value = false; return }
      noSession.value = false; connected.value = true; isHistory.value = false
      const d = msg.data
      if (d.sessionInfo) sessionInfo.value = d.sessionInfo
      if (d.trackStatus) trackStatus.value = d.trackStatus
      if (d.weatherData) weatherData.value = d.weatherData
      if (d.lapCount) lapCount.value = d.lapCount
      if (d.timingData) timingData.value = d.timingData
      if (d.raceControlMessages) raceControlMessages.value = d.raceControlMessages
      if (d.driverList) driverList.value = d.driverList
      if (d.extrapolatedClock) extrapolatedClock.value = d.extrapolatedClock
      if (d.sessionStatus !== undefined) sessionStatus.value = d.sessionStatus
      if (d.sessionData !== undefined) sessionData.value = d.sessionData
      if (d.timingStats !== undefined) timingStats.value = d.timingStats
      if (d.timingAppData !== undefined) timingAppData.value = d.timingAppData
      if (d.championshipPrediction !== undefined) championshipPrediction.value = d.championshipPrediction
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
        <h1 class="text-lg font-bold text-[#f0f0f0]">{{ isHistory ? 'Last Race' : 'Live Timing' }}</h1>
        <span v-if="isHistory" class="text-xs px-2 py-1 rounded bg-[#ffc906]/10 text-[#ffc906]">
          {{ historyMessage }}
        </span>
        <LiveTrackStatusBanner v-if="trackStatus?.Status && !isHistory" :status="trackStatus.Status" />
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
          <span v-if="weatherData.AirTemp">Air {{ weatherData.AirTemp }}°C</span>
          <span v-if="weatherData.TrackTemp">Track {{ weatherData.TrackTemp }}°C</span>
          <span v-if="weatherData.Humidity">RH {{ weatherData.Humidity }}%</span>
          <span v-if="weatherData.WindSpeed">Wind {{ weatherData.WindSpeed }}</span>
          <span v-if="weatherData.Rainfall === '1'" class="text-blue-400">RAIN</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" :class="connected ? (isHistory ? 'bg-[#ffc906]' : 'bg-[#00d25b] animate-pulse') : 'bg-[#e10600]'" />
          <span class="text-[10px] font-bold tracking-wider" :class="connected ? (isHistory ? 'text-[#ffc906]' : 'text-[#00d25b]') : 'text-[#444]'">
            {{ connected ? (isHistory ? 'LAST RACE' : 'LIVE') : 'OFF' }}
          </span>
        </div>
      </div>
    </div>

    <!-- No session -->
    <div v-if="noSession && !isHistory" class="text-center py-24">
      <div class="w-16 h-16 rounded-full bg-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-radio" class="w-6 h-6 text-[#444]" />
      </div>
      <h2 class="text-base font-bold text-[#8a8a8a] mb-1">No hay sesion activa</h2>
      <p class="text-xs text-[#444] max-w-sm mx-auto mb-6">
        Se conecta automaticamente cuando hay Practice, Qualifying o Carrera.
      </p>
      <button
        @click="loadHistory"
        class="px-4 py-2 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-semibold text-[#f0f0f0] hover:bg-[#141414] transition-colors"
      >
        Ver última carrera
      </button>
    </div>

    <!-- Live content -->
    <div v-else-if="connected" class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- Timing tower -->
      <div class="lg:col-span-3 rounded-xl bg-[#0a0a0a] border border-[#141414] overflow-hidden">
        <!-- Header -->
        <div class="px-3 py-2 border-b border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider font-medium">
          <div class="flex items-center gap-2 justify-between">
            <div class="flex-1">Pos • Driver • Team</div>
            <div class="flex gap-4 text-right">
              <span>INT</span>
              <span>GAP</span>
              <span>LAST</span>
              <span>BEST</span>
              <span>PIT</span>
            </div>
          </div>
        </div>

        <!-- Rows using new DriverRow component -->
        <table class="w-full">
          <tbody>
            <DriverRow
              v-for="d in sortedDrivers"
              :key="d.number"
              :position="d.position"
              :number="d.number"
              :given="d.broadcastName?.split(' ')[0] || d.tla"
              :family="d.broadcastName?.split(' ').slice(1).join(' ') || ''"
              :tla="d.tla"
              :team="d.teamName || ''"
              :teamId="d.teamId || ''"
              :team-color="d.teamColour"
              :gap="d.gap"
              :interval="d.interval"
              :last-lap="d.lastLap"
              :best-lap="d.bestLap"
              :last-lap-fastest="d.lastLapFastest"
              :last-lap-personal="d.lastLapPersonal"
              :pit-stops="d.pitStops"
              :in-pit="d.inPit"
              :pit-out="d.pitOut"
              :retired="d.retired"
              :stopped="d.stopped"
            />
          </tbody>
        </table>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Circuito / sesión -->
        <div
          v-if="sessionInfo?.Meeting"
          class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 space-y-2"
        >
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-1">Sesión</h3>
          <p v-if="sessionInfo.Meeting.Circuit?.ShortName" class="text-sm font-semibold text-[#f0f0f0]">
            {{ sessionInfo.Meeting.Circuit.ShortName }}
          </p>
          <p v-if="sessionInfo.Meeting.Location || sessionInfo.Meeting.Country?.Name" class="text-[11px] text-[#8a8a8a]">
            <span v-if="sessionInfo.Meeting.Location">{{ sessionInfo.Meeting.Location }}</span>
            <span v-if="sessionInfo.Meeting.Location && sessionInfo.Meeting.Country?.Name"> · </span>
            <span v-if="sessionInfo.Meeting.Country?.Name">{{ sessionInfo.Meeting.Country.Name }}</span>
          </p>
          <p v-if="sessionInfo.Type" class="text-[10px] text-[#5a5a5a] uppercase tracking-wide">
            {{ sessionInfo.Type }}
          </p>
        </div>

        <!-- Clima (detalle) -->
        <div v-if="weatherData" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Clima</h3>
          <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[11px]">
            <dt class="text-[#5a5a5a]">Aire</dt>
            <dd class="font-timing text-[#f0f0f0] text-right">{{ weatherData.AirTemp != null ? `${weatherData.AirTemp} °C` : '—' }}</dd>
            <dt class="text-[#5a5a5a]">Pista</dt>
            <dd class="font-timing text-[#f0f0f0] text-right">{{ weatherData.TrackTemp != null ? `${weatherData.TrackTemp} °C` : '—' }}</dd>
            <dt class="text-[#5a5a5a]">Humedad</dt>
            <dd class="font-timing text-[#f0f0f0] text-right">{{ weatherData.Humidity != null ? `${weatherData.Humidity}%` : '—' }}</dd>
            <dt class="text-[#5a5a5a]">Presión</dt>
            <dd class="font-timing text-[#f0f0f0] text-right">{{ weatherData.Pressure ?? '—' }}</dd>
            <dt class="text-[#5a5a5a]">Viento</dt>
            <dd class="font-timing text-[#f0f0f0] text-right">
              <template v-if="weatherData.WindSpeed || weatherData.WindDirection">
                {{ weatherData.WindSpeed || '—' }}
                <span v-if="weatherData.WindDirection" class="text-[#8a8a8a]"> · {{ weatherData.WindDirection }}</span>
              </template>
              <template v-else>—</template>
            </dd>
            <dt class="text-[#5a5a5a]">Lluvia</dt>
            <dd class="text-right" :class="weatherData.Rainfall === '1' ? 'text-blue-400 font-medium' : 'text-[#8a8a8a]'">
              {{ weatherData.Rainfall === '1' ? 'Sí' : 'No' }}
            </dd>
          </dl>
        </div>

        <!-- SessionData (campos planos) -->
        <div v-if="sessionDataRows.length" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Session data</h3>
          <dl class="space-y-1.5">
            <div v-for="row in sessionDataRows" :key="row.key" class="flex justify-between gap-2 text-[11px]">
              <dt class="text-[#5a5a5a] truncate">{{ row.key }}</dt>
              <dd class="font-timing text-[#c0c0c0] text-right shrink-0">{{ row.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- Estado (feed SessionStatus) -->
        <div v-if="sessionStatusRows.length" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Estado</h3>
          <dl class="space-y-1.5">
            <div v-for="row in sessionStatusRows" :key="row.key" class="flex justify-between gap-2 text-[11px]">
              <dt class="text-[#5a5a5a] truncate">{{ row.key }}</dt>
              <dd class="font-timing text-[#c0c0c0] text-right shrink-0">{{ row.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- TimingAppData -->
        <div v-if="timingAppDataRows.length" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">App timing</h3>
          <dl class="space-y-1.5">
            <div v-for="row in timingAppDataRows" :key="row.key" class="flex justify-between gap-2 text-[11px]">
              <dt class="text-[#5a5a5a] truncate">{{ row.key }}</dt>
              <dd class="font-timing text-[#c0c0c0] text-right shrink-0">{{ row.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- TimingStats (campos planos que mande el feed) -->
        <div v-if="timingStatsRows.length" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Stats</h3>
          <dl class="space-y-1.5">
            <div v-for="row in timingStatsRows" :key="row.key" class="flex justify-between gap-2 text-[11px]">
              <dt class="text-[#5a5a5a] truncate">{{ row.key }}</dt>
              <dd class="font-timing text-[#c0c0c0] text-right shrink-0">{{ row.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- Championship prediction (resumen) -->
        <div v-if="championshipRows.length" class="rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] p-4">
          <h3 class="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Campeonato</h3>
          <dl class="space-y-1.5">
            <div v-for="row in championshipRows" :key="row.key" class="flex justify-between gap-2 text-[11px]">
              <dt class="text-[#5a5a5a] truncate">{{ row.key }}</dt>
              <dd class="font-timing text-[#c0c0c0] text-right shrink-0 max-w-[10rem] truncate">{{ row.value }}</dd>
            </div>
          </dl>
        </div>

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
