// F1 2026 Driver Roster
// Photo URLs from formula1.com Cloudinary CDN
const F1_IMG = 'https://media.formula1.com/image/upload'
const F1_PHOTO = (team: string, id: string) =>
  `${F1_IMG}/f_auto,c_limit,w_360,q_auto/v1740000001/common/f1/2026/${team}/${id}/2026${team}${id}right`
const F1_NUMBER = (team: string, id: string) =>
  `${F1_IMG}/f_auto,c_fit,w_256,q_auto/v1740000001/common/f1/2026/${team}/${id}/2026${team}${id}numberwhitefrless`

export const DRIVERS_2026 = [
  { number: '1', givenName: 'Max', familyName: 'Verstappen', nameAcronym: 'VER', team: 'Red Bull', teamId: 'red-bull', nationality: 'Dutch', f1Id: 'maxver01', f1Team: 'redbullracing' },
  { number: '4', givenName: 'Isack', familyName: 'Hadjar', nameAcronym: 'HAD', team: 'Red Bull', teamId: 'red-bull', nationality: 'Swedish', f1Id: 'isahad01', f1Team: 'redbullracing' },
  { number: '81', givenName: 'Lando', familyName: 'Norris', nameAcronym: 'NOR', team: 'McLaren', teamId: 'mclaren', nationality: 'British', f1Id: 'lannor01', f1Team: 'mclaren' },
  { number: '5', givenName: 'Oscar', familyName: 'Piastri', nameAcronym: 'PIA', team: 'McLaren', teamId: 'mclaren', nationality: 'Australian', f1Id: 'oscpia01', f1Team: 'mclaren' },
  { number: '16', givenName: 'Charles', familyName: 'Leclerc', nameAcronym: 'LEC', team: 'Ferrari', teamId: 'ferrari', nationality: 'Monegasque', f1Id: 'chalec01', f1Team: 'ferrari' },
  { number: '44', givenName: 'Lewis', familyName: 'Hamilton', nameAcronym: 'HAM', team: 'Ferrari', teamId: 'ferrari', nationality: 'British', f1Id: 'lewham01', f1Team: 'ferrari' },
  { number: '63', givenName: 'George', familyName: 'Russell', nameAcronym: 'RUS', team: 'Mercedes', teamId: 'mercedes', nationality: 'British', f1Id: 'georus01', f1Team: 'mercedes' },
  { number: '12', givenName: 'Kimi', familyName: 'Antonelli', nameAcronym: 'ANT', team: 'Mercedes', teamId: 'mercedes', nationality: 'Italian', f1Id: 'andant01', f1Team: 'mercedes' },
  { number: '3', givenName: 'Fernando', familyName: 'Alonso', nameAcronym: 'ALO', team: 'Aston Martin', teamId: 'aston-martin', nationality: 'Spanish', f1Id: 'feralo01', f1Team: 'astonmartin' },
  { number: '18', givenName: 'Lance', familyName: 'Stroll', nameAcronym: 'STR', team: 'Aston Martin', teamId: 'aston-martin', nationality: 'Canadian', f1Id: 'lanstr01', f1Team: 'astonmartin' },
  { number: '31', givenName: 'Pierre', familyName: 'Gasly', nameAcronym: 'GAS', team: 'Alpine', teamId: 'alpine', nationality: 'French', f1Id: 'piegas01', f1Team: 'alpine' },
  { number: '43', givenName: 'Franco', familyName: 'Colapinto', nameAcronym: 'COL', team: 'Alpine', teamId: 'alpine', nationality: 'Argentine', f1Id: 'fracol01', f1Team: 'alpine' },
  { number: '2', givenName: 'Carlos', familyName: 'Sainz', nameAcronym: 'SAI', team: 'Williams', teamId: 'williams', nationality: 'Spanish', f1Id: 'carsai01', f1Team: 'williams' },
  { number: '23', givenName: 'Alexander', familyName: 'Albon', nameAcronym: 'ALB', team: 'Williams', teamId: 'williams', nationality: 'Thai-British', f1Id: 'alealb01', f1Team: 'williams' },
  { number: '27', givenName: 'Nico', familyName: 'Hulkenberg', nameAcronym: 'HUL', team: 'Audi', teamId: 'audi', nationality: 'German', f1Id: 'nichul01', f1Team: 'audi' },
  { number: '30', givenName: 'Gabriel', familyName: 'Bortoleto', nameAcronym: 'BOT', team: 'Audi', teamId: 'audi', nationality: 'Brazilian', f1Id: 'gabbor01', f1Team: 'audi' },
  { number: '24', givenName: 'Liam', familyName: 'Lawson', nameAcronym: 'LAW', team: 'Racing Bulls', teamId: 'racing-bulls', nationality: 'New Zealander', f1Id: 'lialaw01', f1Team: 'racingbulls' },
  { number: '7', givenName: 'Arvid', familyName: 'Lindblad', nameAcronym: 'LIN', team: 'Racing Bulls', teamId: 'racing-bulls', nationality: 'Swedish', f1Id: 'arvlin01', f1Team: 'racingbulls' },
  { number: '14', givenName: 'Esteban', familyName: 'Ocon', nameAcronym: 'OCO', team: 'Haas', teamId: 'haas', nationality: 'French', f1Id: 'estoco01', f1Team: 'haasf1team' },
  { number: '50', givenName: 'Oliver', familyName: 'Bearman', nameAcronym: 'BEA', team: 'Haas', teamId: 'haas', nationality: 'British', f1Id: 'olibea01', f1Team: 'haasf1team' },
  { number: '11', givenName: 'Sergio', familyName: 'Perez', nameAcronym: 'PER', team: 'Cadillac', teamId: 'cadillac', nationality: 'Mexican', f1Id: 'serper01', f1Team: 'cadillac' },
  { number: '77', givenName: 'Valtteri', familyName: 'Bottas', nameAcronym: 'BOT', team: 'Cadillac', teamId: 'cadillac', nationality: 'Finnish', f1Id: 'valbot01', f1Team: 'cadillac' }
]

// Get driver photo URL
export function getDriverPhoto(driverIdOrName: string): string {
  const driver = DRIVERS_2026.find(d =>
    d.nameAcronym === driverIdOrName ||
    d.familyName.toLowerCase() === driverIdOrName.toLowerCase() ||
    d.number === driverIdOrName ||
    `${d.givenName} ${d.familyName}`.toLowerCase() === driverIdOrName.toLowerCase()
  )
  if (!driver) return ''
  return F1_PHOTO(driver.f1Team, driver.f1Id)
}

// Get driver number graphic URL
export function getDriverNumberImg(driverIdOrName: string): string {
  const driver = DRIVERS_2026.find(d =>
    d.nameAcronym === driverIdOrName ||
    d.familyName.toLowerCase() === driverIdOrName.toLowerCase() ||
    d.number === driverIdOrName
  )
  if (!driver) return ''
  return F1_NUMBER(driver.f1Team, driver.f1Id)
}

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

  const normalized = teamName.toLowerCase().trim()

  // Special cases for API variations
  const specialCases: Record<string, string> = {
    'rb': 'red-bull',
    'rb f1 team': 'red-bull',
    'red bull': 'red-bull',
    'red bull f1 team': 'red-bull',
    'red bull racing': 'red-bull',
    'oracle red bull racing': 'red-bull',
    'mclaren': 'mclaren',
    'mclaren f1 team': 'mclaren',
    'ferrari': 'ferrari',
    'ferrari f1 team': 'ferrari',
    'mercedes': 'mercedes',
    'mercedes f1 team': 'mercedes',
    'williams': 'williams',
    'williams racing': 'williams',
    'alpine': 'alpine',
    'alpine f1 team': 'alpine',
    'haas': 'haas',
    'haas f1 team': 'haas',
    'aston martin': 'aston-martin',
    'aston martin f1 team': 'aston-martin',
    'audi': 'audi',
    'audi f1 team': 'audi',
    'sauber': 'audi',
    'kick sauber': 'audi',
    'racing bulls': 'racing-bulls',
    'racing bulls f1 team': 'racing-bulls',
    'cadillac': 'cadillac'
  }

  // Check special cases first
  if (specialCases[normalized]) {
    return specialCases[normalized]
  }

  // Clean team name (remove "Oracle", " F1 Team" suffix and " Racing")
  const cleanName = normalized
    .replace(/^oracle\s+/i, '')
    .replace(/\s+f1\s+team\s*$/i, '')
    .replace(/\s+racing\s*$/i, '')
    .trim()

  // Try exact match
  let team = TEAMS_2026.find(t => t.name.toLowerCase() === cleanName)
  if (team) return team.id

  // Try partial match
  team = TEAMS_2026.find(t => cleanName.includes(t.name.toLowerCase()))
  if (team) return team.id

  // Last resort: check if input contains team name
  team = TEAMS_2026.find(t => normalized.includes(t.name.toLowerCase()))
  return team?.id || ''
}

export function getDriversByTeam(teamId: string) {
  return DRIVERS_2026.filter(d => d.teamId === teamId)
}

export function getTeamDrivers(teamName: string) {
  // Use getTeamIdByName which handles all variations
  const teamId = getTeamIdByName(teamName)
  return teamId ? getDriversByTeam(teamId) : []
}
