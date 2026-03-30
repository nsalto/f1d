// Shared F1 types used across the app

export interface Race {
  id: number
  season: string
  round: number
  raceName: string
  circuitId: string
  circuitName: string
  locality: string | null
  country: string | null
  date: string
  time: string | null
  fp1Date: string | null
  fp1Time: string | null
  fp2Date: string | null
  fp2Time: string | null
  fp3Date: string | null
  fp3Time: string | null
  qualyDate: string | null
  qualyTime: string | null
  sprintDate: string | null
  sprintTime: string | null
}

export interface DriverStanding {
  position: number
  points: number
  wins: number
  driverId: string
  driverCode: string | null
  driverNumber: string | null
  givenName: string
  familyName: string
  nationality: string | null
  constructorId: string | null
  constructorName: string | null
}

export interface ConstructorStanding {
  position: number
  points: number
  wins: number
  constructorId: string
  constructorName: string
  nationality: string | null
}

export interface RaceResult {
  position: number | null
  positionText: string | null
  points: number | null
  grid: number | null
  laps: number | null
  status: string | null
  time: string | null
  fastestLapRank: number | null
  fastestLapTime: string | null
  driverId: string
  driverCode: string | null
  givenName: string | null
  familyName: string | null
  constructorId: string | null
  constructorName: string | null
}

export interface QualifyingResult {
  position: number | null
  driverId: string
  driverCode: string | null
  givenName: string | null
  familyName: string | null
  constructorId: string | null
  constructorName: string | null
  q1: string | null
  q2: string | null
  q3: string | null
}

export interface LapData {
  driverNumber: number
  lapNumber: number
  lapDuration: number | null
  sector1: number | null
  sector2: number | null
  sector3: number | null
  i1Speed: number | null
  i2Speed: number | null
  stSpeed: number | null
}

export interface PitStop {
  driverNumber: number
  lapNumber: number
  pitDuration: number | null
}

export interface Stint {
  driverNumber: number
  stintNumber: number
  compound: string | null
  lapStart: number | null
  lapEnd: number | null
  tyreAgeAtStart: number | null
}

export interface F1Driver {
  driverNumber: number
  broadcastName: string | null
  fullName: string | null
  nameAcronym: string | null
  teamName: string | null
  teamColour: string | null
  headshotUrl: string | null
}
