import { F1LiveTimingClient } from './f1-signalr'

// Singleton state -- shared between plugin and API routes
let _client: F1LiveTimingClient | null = null

export function setF1LiveClient(client: F1LiveTimingClient) {
  _client = client
}

export function useF1LiveTiming(): F1LiveTimingClient | null {
  return _client
}

/** Shared shape for GET /api/live/timing and SSE snapshots */
export function liveTimingPayload(client: F1LiveTimingClient) {
  return {
    sessionInfo: client.getSessionInfo(),
    trackStatus: client.getTrackStatus(),
    weatherData: client.getWeatherData(),
    lapCount: client.getLapCount(),
    timingData: client.getTimingData(),
    raceControlMessages: client.getRaceControlMessages(),
    driverList: client.getDriverList(),
    extrapolatedClock: client.getExtrapolatedClock(),
    sessionStatus: client.getSessionStatus(),
    sessionData: client.getSessionData(),
    timingStats: client.getTimingStats(),
    timingAppData: client.getTimingAppData(),
    championshipPrediction: client.getChampionshipPrediction()
  }
}
