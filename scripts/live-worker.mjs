#!/usr/bin/env node
/**
 * F1 Live Timing Worker — standalone (no Nitro bundle).
 *
 * Por qué existe: @microsoft/signalr usa require() dinámicos que rompen el bundle
 * de Nitro en producción ("Cannot find module 'ws'", "requireFunc is not a function",
 * etc.). En vez de pelearle al bundler, corremos el cliente SignalR como un proceso
 * vanilla Node (con node_modules completo, sin bundle), que escribe el estado en una
 * tabla `live_state` de Postgres. La app Nuxt lee de esa tabla.
 *
 * Cómo correrlo:
 *   DATABASE_URL=postgresql://... node scripts/live-worker.mjs
 *
 * En Railway: deployar como segundo servicio con start command:
 *   node scripts/live-worker.mjs
 * (sin HTTP, no se hiberna por inactividad de tráfico web)
 *
 * Topics que pedimos al SignalR (free, sin auth F1TV):
 *   Heartbeat, TimingData, TimingStats, TimingAppData, DriverList, SessionInfo,
 *   SessionData, SessionStatus, TrackStatus, WeatherData, RaceControlMessages,
 *   LapCount, ExtrapolatedClock, TeamRadio, ChampionshipPrediction
 */

import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'
import postgres from 'postgres'

// ─── Config ───────────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL
if (!DATABASE_URL) {
  console.error('[worker] Missing DATABASE_URL or DATABASE_PUBLIC_URL env var')
  process.exit(1)
}

const TOPICS = [
  'Heartbeat',
  'TimingData',
  'TimingStats',
  'TimingAppData',
  'DriverList',
  'SessionInfo',
  'SessionData',
  'SessionStatus',
  'TrackStatus',
  'WeatherData',
  'RaceControlMessages',
  'LapCount',
  'ExtrapolatedClock',
  'TeamRadio',
  'ChampionshipPrediction'
]

// Cuánto esperamos para coalescer ráfagas de updates antes de escribir a DB.
// 500ms da latencia <1s en el frontend pero evita tirar 100 writes/s a Postgres.
const WRITE_COALESCE_MS = 500

// Cada cuánto reintentamos conexión cuando no hay sesión activa o falló.
// 30s es razonable: F1 tarda ~30s en abrir el broadcast antes de cada sesión.
const RECONNECT_MIN_MS = 30_000
const RECONNECT_MAX_MS = 5 * 60_000

// ─── DB ───────────────────────────────────────────────────────────────────────
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 2,
  idle_timeout: 30,
  connect_timeout: 10
})

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS live_state (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      payload JSONB NOT NULL,
      session_status TEXT,
      session_path TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_feed_topic TEXT,
      feed_count INTEGER NOT NULL DEFAULT 0
    )
  `
  await sql`
    INSERT INTO live_state (id, payload, session_status)
    VALUES (1, '{}'::jsonb, 'initialized')
    ON CONFLICT (id) DO NOTHING
  `
}

async function writeState(state, lastTopic, feedCount) {
  const sessionStatus = state?.SessionStatus?.Status || state?.SessionStatus?.SessionStatus || null
  const sessionPath = state?.SessionInfo?.Path || null
  await sql`
    UPDATE live_state SET
      payload = ${sql.json(state)},
      session_status = ${sessionStatus},
      session_path = ${sessionPath},
      updated_at = NOW(),
      last_feed_topic = ${lastTopic || null},
      feed_count = ${feedCount}
    WHERE id = 1
  `
}

// ─── Cookie + handshake F1 SignalR ───────────────────────────────────────────
async function getAwsAlbCookie() {
  const res = await fetch('https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1', {
    method: 'OPTIONS'
  })
  const setCookie = res.headers.get('set-cookie') || ''
  const m = setCookie.match(/AWSALBCORS=([^;]+)/)
  return m ? `AWSALBCORS=${m[1]}` : ''
}

// ─── Estado interno ──────────────────────────────────────────────────────────
const state = {}
let feedCount = 0
let lastTopic = null
let pendingFlush = null
let connection = null

// Inflate de topics .z (CarData.z, Position.z) — no los pedimos por ahora pero dejo el helper
async function inflateZ(b64) {
  const { promisify } = await import('node:util')
  const { inflateRaw } = await import('node:zlib')
  const inflate = promisify(inflateRaw)
  const buf = Buffer.from(b64, 'base64')
  const out = await inflate(buf)
  return JSON.parse(out.toString('utf-8'))
}

function deepMerge(target, source) {
  if (source === null || source === undefined) return target
  if (typeof source !== 'object' || Array.isArray(source)) return source
  if (typeof target !== 'object' || target === null || Array.isArray(target)) target = {}
  const result = { ...target }
  for (const k of Object.keys(source)) result[k] = deepMerge(result[k], source[k])
  return result
}

function scheduleFlush() {
  if (pendingFlush) return
  pendingFlush = setTimeout(async () => {
    pendingFlush = null
    try {
      await writeState(state, lastTopic, feedCount)
    } catch (e) {
      console.error('[worker] DB write failed:', e.message)
    }
  }, WRITE_COALESCE_MS)
}

function applyFeed(topic, data) {
  state[topic] = deepMerge(state[topic], data)
  lastTopic = topic
  feedCount++
  scheduleFlush()
}

// ─── Conexión SignalR con backoff ────────────────────────────────────────────
async function connect() {
  const cookie = await getAwsAlbCookie()
  console.log(`[worker] Got cookie: ${cookie ? 'yes' : 'no'}`)

  connection = new HubConnectionBuilder()
    .withUrl('https://livetiming.formula1.com/signalrcore', {
      transport: HttpTransportType.WebSockets,
      headers: cookie ? { Cookie: cookie } : {},
      skipNegotiation: false
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('feed', (topic, data) => {
    if (topic === 'Heartbeat') return
    if (topic.endsWith('.z') && typeof data === 'string') {
      const baseTopic = topic.replace('.z', '')
      inflateZ(data).then(decoded => applyFeed(baseTopic, decoded)).catch(() => {})
    } else {
      applyFeed(topic, data)
    }
  })

  connection.onclose((err) => {
    console.warn('[worker] Connection closed:', err?.message || '(graceful)')
  })

  connection.onreconnected(async () => {
    console.log('[worker] Reconnected, re-subscribing')
    try {
      const initial = await connection.invoke('Subscribe', TOPICS)
      Object.assign(state, initial || {})
      scheduleFlush()
    } catch (e) {
      console.error('[worker] Re-subscribe failed:', e.message)
    }
  })

  await connection.start()
  console.log('[worker] Connected to F1 SignalR')

  const initial = await connection.invoke('Subscribe', TOPICS)
  if (initial) {
    Object.assign(state, initial)
    console.log(`[worker] Initial state with ${Object.keys(initial).length} topics`)
    if (initial.SessionInfo?.Meeting) {
      console.log(`[worker] Session: ${initial.SessionInfo.Meeting.Name} - ${initial.SessionInfo.Name}`)
    }
    if (initial.SessionStatus) {
      console.log(`[worker] SessionStatus: ${initial.SessionStatus.Status}`)
    }
    if (initial.LapCount) {
      console.log(`[worker] Lap: ${initial.LapCount.CurrentLap}/${initial.LapCount.TotalLaps}`)
    }
    scheduleFlush()
  }
}

let backoffMs = RECONNECT_MIN_MS
let stopped = false

function withJitter(ms) {
  return Math.max(1000, Math.round(ms + ms * 0.2 * (Math.random() * 2 - 1)))
}

async function run() {
  if (stopped) return
  try {
    await connect()
    backoffMs = RECONNECT_MIN_MS
    // Mantener vivo — la conexión se mantiene sola, este loop solo hace logs periódicos
    setInterval(() => {
      console.log(`[worker] alive | feeds=${feedCount} | session=${state?.SessionStatus?.Status || '?'} | lap=${state?.LapCount?.CurrentLap || '?'}/${state?.LapCount?.TotalLaps || '?'}`)
    }, 60_000).unref()
  } catch (e) {
    console.warn(`[worker] Connect failed: ${e.message} | retrying in ${(backoffMs / 1000) | 0}s`)
    setTimeout(run, withJitter(backoffMs))
    backoffMs = Math.min(backoffMs * 2, RECONNECT_MAX_MS)
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
async function shutdown(signal) {
  if (stopped) return
  stopped = true
  console.log(`[worker] Shutting down (${signal})`)
  if (pendingFlush) clearTimeout(pendingFlush)
  try {
    await writeState(state, lastTopic, feedCount)
  } catch (e) {
    console.warn('[worker] final write failed:', e.message)
  }
  try {
    if (connection) await connection.stop()
  } catch {
    // already stopped
  }
  try {
    await sql.end({ timeout: 5 })
  } catch {
    // already ended
  }
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

// ─── Boot ────────────────────────────────────────────────────────────────────
console.log('[worker] Starting F1 live timing worker')
console.log(`[worker] Node ${process.versions.node} | DB host=${new URL(DATABASE_URL).host}`)

await ensureTable()
console.log('[worker] DB ready')

await run()
