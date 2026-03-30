// F1 2026 Driver Roster
export const DRIVERS_2026 = [
  { number: '1', givenName: 'Max', familyName: 'Verstappen', nameAcronym: 'VER', team: 'Red Bull', teamId: 'red-bull', nationality: 'Dutch' },
  { number: '4', givenName: 'Isack', familyName: 'Hadjar', nameAcronym: 'HAD', team: 'Red Bull', teamId: 'red-bull', nationality: 'Swedish' },
  { number: '81', givenName: 'Lando', familyName: 'Norris', nameAcronym: 'NOR', team: 'McLaren', teamId: 'mclaren', nationality: 'British' },
  { number: '5', givenName: 'Oscar', familyName: 'Piastri', nameAcronym: 'PIA', team: 'McLaren', teamId: 'mclaren', nationality: 'Australian' },
  { number: '16', givenName: 'Charles', familyName: 'Leclerc', nameAcronym: 'LEC', team: 'Ferrari', teamId: 'ferrari', nationality: 'Monegasque' },
  { number: '44', givenName: 'Lewis', familyName: 'Hamilton', nameAcronym: 'HAM', team: 'Ferrari', teamId: 'ferrari', nationality: 'British' },
  { number: '63', givenName: 'George', familyName: 'Russell', nameAcronym: 'RUS', team: 'Mercedes', teamId: 'mercedes', nationality: 'British' },
  { number: '12', givenName: 'Kimi', familyName: 'Antonelli', nameAcronym: 'ANT', team: 'Mercedes', teamId: 'mercedes', nationality: 'Italian' },
  { number: '3', givenName: 'Fernando', familyName: 'Alonso', nameAcronym: 'ALO', team: 'Aston Martin', teamId: 'aston-martin', nationality: 'Spanish' },
  { number: '18', givenName: 'Lance', familyName: 'Stroll', nameAcronym: 'STR', team: 'Aston Martin', teamId: 'aston-martin', nationality: 'Canadian' },
  { number: '31', givenName: 'Pierre', familyName: 'Gasly', nameAcronym: 'GAS', team: 'Alpine', teamId: 'alpine', nationality: 'French' },
  { number: '43', givenName: 'Franco', familyName: 'Colapinto', nameAcronym: 'COL', team: 'Alpine', teamId: 'alpine', nationality: 'Argentine' },
  { number: '2', givenName: 'Carlos', familyName: 'Sainz', nameAcronym: 'SAI', team: 'Williams', teamId: 'williams', nationality: 'Spanish' },
  { number: '23', givenName: 'Alexander', familyName: 'Albon', nameAcronym: 'ALB', team: 'Williams', teamId: 'williams', nationality: 'Thai-British' },
  { number: '27', givenName: 'Nico', familyName: 'Hulkenberg', nameAcronym: 'HUL', team: 'Audi', teamId: 'audi', nationality: 'German' },
  { number: '30', givenName: 'Gabriel', familyName: 'Bortoleto', nameAcronym: 'BOT', team: 'Audi', teamId: 'audi', nationality: 'Brazilian' },
  { number: '24', givenName: 'Liam', familyName: 'Lawson', nameAcronym: 'LAW', team: 'Racing Bulls', teamId: 'racing-bulls', nationality: 'New Zealander' },
  { number: '7', givenName: 'Arvid', familyName: 'Lindblad', nameAcronym: 'LIN', team: 'Racing Bulls', teamId: 'racing-bulls', nationality: 'Swedish' },
  { number: '14', givenName: 'Esteban', familyName: 'Ocon', nameAcronym: 'OCO', team: 'Haas', teamId: 'haas', nationality: 'French' },
  { number: '50', givenName: 'Oliver', familyName: 'Bearman', nameAcronym: 'BEA', team: 'Haas', teamId: 'haas', nationality: 'British' },
  { number: '11', givenName: 'Sergio', familyName: 'Perez', nameAcronym: 'PER', team: 'Cadillac', teamId: 'cadillac', nationality: 'Mexican' },
  { number: '77', givenName: 'Valtteri', familyName: 'Bottas', nameAcronym: 'BOT', team: 'Cadillac', teamId: 'cadillac', nationality: 'Finnish' }
]

export const TEAMS_2026 = [
  { id: 'red-bull', name: 'Red Bull' },
  { id: 'mclaren', name: 'McLaren' },
  { id: 'ferrari', name: 'Ferrari' },
  { id: 'mercedes', name: 'Mercedes' },
  { id: 'aston-martin', name: 'Aston Martin' },
  { id: 'alpine', name: 'Alpine' },
  { id: 'williams', name: 'Williams' },
  { id: 'audi', name: 'Audi' },
  { id: 'racing-bulls', name: 'Racing Bulls' },
  { id: 'haas', name: 'Haas' },
  { id: 'cadillac', name: 'Cadillac' }
]

// Map driver number to team ID
export function getTeamIdByDriverNumber(driverNumber: string | number): string {
  const driver = DRIVERS_2026.find(d => d.number === String(driverNumber))
  return driver?.teamId || ''
}

// Map team name to team ID
export function getTeamIdByName(teamName: string | undefined): string {
  if (!teamName) return ''
  // Clean team name (remove " F1 Team" suffix)
  const cleanName = teamName.replace(/\s+F1\s+Team\s*$/i, '')
  const team = TEAMS_2026.find(t => t.name.toLowerCase() === cleanName.toLowerCase())
  return team?.id || ''
}

export function getDriversByTeam(teamId: string) {
  return DRIVERS_2026.filter(d => d.teamId === teamId)
}

export function getTeamDrivers(teamName: string) {
  // Clean team name (remove " F1 Team" suffix)
  const cleanName = teamName.replace(/\s+F1\s+Team\s*$/i, '')
  const team = TEAMS_2026.find(t => t.name.toLowerCase() === cleanName.toLowerCase())
  return team ? getDriversByTeam(team.id) : []
}
