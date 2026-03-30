export const TEAM_COLORS: Record<string, string> = {
  // 2026 Official Team Colors
  'Red Bull': '#E30118',
  'McLaren': '#FF8700',
  'Ferrari': '#DC0000',
  'Mercedes': '#00D4BE',
  'Williams': '#0082FA',
  'Aston Martin': '#006F62',
  'Alpine': '#FF1A7F',
  'Haas': '#FFFFFF',
  'Racing Bulls': '#0E3050',
  'Audi': '#E5001C',
  'Cadillac': '#FFFFFF',

  // Aliases / Fallbacks
  'Red Bull Racing': '#E30118',
  'RB': '#FFFFFF',
  'Sauber': '#E5001C',
  'Kick Sauber': '#E5001C',

  // Lowercase variations
  'red_bull': '#E30118',
  'red_bull_racing': '#E30118',
  'mclaren': '#FF8700',
  'ferrari': '#DC0000',
  'mercedes': '#00D4BE',
  'williams': '#0082FA',
  'aston_martin': '#006F62',
  'alpine': '#FF1A7F',
  'haas': '#FFFFFF',
  'racing_bulls': '#0E3050',
  'audi': '#E5001C',
  'cadillac': '#FFFFFF'
}

export function getTeamColor(team: string | undefined): string {
  if (!team) return '#666666'
  const normalized = team.toLowerCase().replace(/\s+/g, '_')
  return TEAM_COLORS[team] || TEAM_COLORS[normalized] || '#666666'
}
