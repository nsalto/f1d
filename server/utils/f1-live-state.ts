import { F1LiveTimingClient } from './f1-signalr'

// Singleton state -- shared between plugin and API routes
let _client: F1LiveTimingClient | null = null

export function setF1LiveClient(client: F1LiveTimingClient) {
  _client = client
}

export function useF1LiveTiming(): F1LiveTimingClient | null {
  return _client
}
