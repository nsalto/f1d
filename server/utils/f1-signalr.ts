import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HttpTransportType,
} from '@microsoft/signalr'

// ─── Topics ────────────────────────────────────────────────────────────────────
// Free topics (no auth required)
export const FREE_TOPICS = [
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
  'ChampionshipPrediction',
] as const

// These require F1TV subscription token
export const SUBSCRIBER_TOPICS = [
  'CarData.z',
  'Position.z',
  'PitLaneTimeCollection',
  'PitStopSeries',
] as const

export const ALL_TOPICS = [...FREE_TOPICS, ...SUBSCRIBER_TOPICS] as const

export type F1Topic = (typeof ALL_TOPICS)[number]

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface TimingDataLine {
  Position?: string
  GapToLeader?: string
  IntervalToPositionAhead?: { Value?: string; Catching?: boolean }
  Line?: number
  InPit?: boolean
  PitOut?: boolean
  NumberOfPitStops?: number
  NumberOfLaps?: number
  LastLapTime?: { Value?: string; OverallFastest?: boolean; PersonalFastest?: boolean }
  BestLapTime?: { Value?: string; Lap?: number }
  Sectors?: Record<string, {
    Value?: string
    OverallFastest?: boolean
    PersonalFastest?: boolean
    Segments?: Record<string, { Status?: number }>
  }>
  KnockedOut?: boolean
  Retired?: boolean
  Stopped?: boolean
  Status?: number
}

export interface TimingData {
  Lines?: Record<string, TimingDataLine>
  SessionPart?: number | null
}

export interface WeatherData {
  AirTemp?: string
  Humidity?: string
  Pressure?: string
  Rainfall?: string
  TrackTemp?: string
  WindDirection?: string
  WindSpeed?: string
}

export interface TrackStatus {
  Status?: string
  Message?: string
}

export interface LapCount {
  CurrentLap?: number
  TotalLaps?: number
}

export interface RaceControlMessages {
  Messages?: Record<string, {
    Utc?: string
    Category?: string
    Flag?: string
    Scope?: string
    Message?: string
    Sector?: number
    Lap?: number
    RacingNumber?: string
  }>
}

export interface ExtrapolatedClock {
  Utc?: string
  Remaining?: string
  Extrapolating?: boolean
}

export interface SessionInfo {
  Meeting?: {
    Name?: string
    Location?: string
    Country?: { Name?: string }
    Circuit?: { ShortName?: string }
  }
  Name?: string
  Type?: string
  Path?: string
}

export interface DriverInfo {
  RacingNumber?: string
  BroadcastName?: string
  FullName?: string
  Tla?: string
  Line?: number
  TeamName?: string
  TeamColour?: string
  FirstName?: string
  LastName?: string
  HeadshotUrl?: string
  CountryCode?: string
}

export type DriverList = Record<string, DriverInfo>

// ─── Decompression for .z topics ───────────────────────────────────────────────
// CarData.z and Position.z are base64-encoded raw DEFLATE compressed
export async function inflateF1Data<T>(data: string): Promise<T> {
  // Decode base64 to buffer
  const buffer = Buffer.from(data, 'base64')

  // Use Node.js zlib to raw inflate (not gzip, not zlib -- raw deflate)
  const { inflateRaw } = await import('node:zlib')
  const { promisify } = await import('node:util')
  const inflate = promisify(inflateRaw)

  const result = await inflate(buffer)
  return JSON.parse(result.toString('utf-8'))
}

// ─── Deep merge for delta updates ──────────────────────────────────────────────
// F1 sends sparse updates -- only changed fields. Must deep-merge into state.
export function deepMerge(target: any, source: any): any {
  if (source === null || source === undefined) return target
  if (typeof source !== 'object' || Array.isArray(source)) return source
  if (typeof target !== 'object' || target === null || Array.isArray(target)) {
    target = {}
  }

  const result = { ...target }
  for (const key of Object.keys(source)) {
    result[key] = deepMerge(result[key], source[key])
  }
  return result
}

// ─── Pre-negotiate: get AWSALBCORS cookie ──────────────────────────────────────
async function getAwsAlbCookie(): Promise<string> {
  // Fast-F1 does an OPTIONS request to get the AWSALBCORS cookie
  const res = await fetch('https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1', {
    method: 'OPTIONS',
  })

  const setCookie = res.headers.get('set-cookie') || ''
  const match = setCookie.match(/AWSALBCORS=([^;]+)/)
  if (match) {
    return `AWSALBCORS=${match[1]}`
  }

  // Sometimes it's in a different cookie
  const allCookies = res.headers.getSetCookie?.() || []
  for (const c of allCookies) {
    if (c.includes('AWSALBCORS')) {
      const m = c.match(/AWSALBCORS=([^;]+)/)
      if (m) return `AWSALBCORS=${m[1]}`
    }
  }

  console.warn('[F1 SignalR] Could not get AWSALBCORS cookie, proceeding without it')
  return ''
}

// ─── Main client ───────────────────────────────────────────────────────────────
export interface F1LiveTimingOptions {
  /** F1TV subscription token for CarData.z and Position.z. null = free tier */
  accessToken?: string | null
  /** Which topics to subscribe to */
  topics?: readonly string[]
  /** Called when feed data arrives */
  onFeed?: (topic: string, data: any, timestamp: Date) => void
  /** Called when connection is established with initial state snapshot */
  onInitialState?: (state: Record<string, any>) => void
  /** Called on connection close */
  onClose?: (error?: Error) => void
  /** Called on reconnect */
  onReconnect?: () => void
  /** Log level */
  logLevel?: LogLevel
}

export class F1LiveTimingClient {
  private connection: HubConnection | null = null
  private state: Record<string, any> = {}
  private options: F1LiveTimingOptions
  private cookie: string = ''

  constructor(options: F1LiveTimingOptions = {}) {
    this.options = {
      topics: FREE_TOPICS,
      logLevel: LogLevel.Information,
      ...options,
    }
  }

  get currentState() {
    return this.state
  }

  async start(): Promise<void> {
    // Step 1: Get AWSALBCORS cookie
    this.cookie = await getAwsAlbCookie()
    console.log('[F1 SignalR] Got cookie:', this.cookie ? 'yes' : 'no')

    // Step 2: Build SignalR Core connection
    const builder = new HubConnectionBuilder()
      .withUrl('https://livetiming.formula1.com/signalrcore', {
        // Use WebSockets transport
        transport: HttpTransportType.WebSockets,
        // Inject the cookie and optional auth token
        headers: this.cookie ? { Cookie: this.cookie } : {},
        // For authenticated access, provide token
        accessTokenFactory: this.options.accessToken
          ? () => this.options.accessToken!
          : undefined,
        // Skip negotiate if having issues (direct WebSocket)
        skipNegotiation: false,
      })
      .withAutomaticReconnect()
      .configureLogging(this.options.logLevel!)

    this.connection = builder.build()

    // Step 3: Register feed handler
    // The server sends: feed(topic: string, data: JsonNode, timestamp: DateTimeOffset)
    this.connection.on('feed', (topic: string, data: any, timestamp: string) => {
      // Handle .z compressed topics
      if (topic.endsWith('.z')) {
        const baseTopic = topic.replace('.z', '')
        if (typeof data === 'string') {
          inflateF1Data(data)
            .then((decoded) => {
              this.state[baseTopic] = deepMerge(this.state[baseTopic], decoded)
              this.options.onFeed?.(baseTopic, decoded, new Date(timestamp))
            })
            .catch(err => console.error(`[F1 SignalR] Failed to decompress ${topic}:`, err))
        }
      }
      else {
        this.state[topic] = deepMerge(this.state[topic], data)
        this.options.onFeed?.(topic, data, new Date(timestamp))
      }
    })

    this.connection.onclose((error) => {
      console.log('[F1 SignalR] Connection closed', error?.message)
      this.options.onClose?.(error || undefined)
    })

    this.connection.onreconnected(() => {
      console.log('[F1 SignalR] Reconnected')
      this.options.onReconnect?.()
      // Re-subscribe after reconnect
      this.subscribe().catch(err =>
        console.error('[F1 SignalR] Failed to re-subscribe:', err),
      )
    })

    // Step 4: Start connection
    await this.connection.start()
    console.log('[F1 SignalR] Connected')

    // Step 5: Subscribe and get initial state
    await this.subscribe()
  }

  private async subscribe(): Promise<void> {
    if (!this.connection) return

    // The Subscribe method takes an array of topic names
    // and returns the full current state as a JSON object
    const initialState = await this.connection.invoke<Record<string, any>>(
      'Subscribe',
      this.options.topics,
    )

    if (initialState) {
      this.state = initialState
      console.log('[F1 SignalR] Got initial state with keys:', Object.keys(initialState))

      // Decompress any .z topics in initial state
      for (const key of Object.keys(initialState)) {
        if (key.endsWith('.z') && typeof initialState[key] === 'string') {
          try {
            const baseTopic = key.replace('.z', '')
            const decoded = await inflateF1Data(initialState[key])
            this.state[baseTopic] = decoded
            delete this.state[key]
          }
          catch (err) {
            console.error(`[F1 SignalR] Failed to decompress initial ${key}:`, err)
          }
        }
      }

      this.options.onInitialState?.(this.state)
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
    }
  }

  // Convenience getters for typed access to state
  getTimingData(): TimingData | undefined {
    return this.state.TimingData
  }

  getWeatherData(): WeatherData | undefined {
    return this.state.WeatherData
  }

  getTrackStatus(): TrackStatus | undefined {
    return this.state.TrackStatus
  }

  getLapCount(): LapCount | undefined {
    return this.state.LapCount
  }

  getRaceControlMessages(): RaceControlMessages | undefined {
    return this.state.RaceControlMessages
  }

  getDriverList(): DriverList | undefined {
    return this.state.DriverList
  }

  getSessionInfo(): SessionInfo | undefined {
    return this.state.SessionInfo
  }

  getExtrapolatedClock(): ExtrapolatedClock | undefined {
    return this.state.ExtrapolatedClock
  }
}
