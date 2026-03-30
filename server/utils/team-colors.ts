export const TEAM_COLORS: Record<string, string> = {
  // 2026 Official Team Colors
  'Red Bull Racing': '#E30118',
  'McLaren': '#FF8700',
  'Ferrari': '#DC0000',
  'Mercedes': '#00D4BE',
  'Williams': '#0082FA',
  'Aston Martin': '#006F62',
  'Alpine': '#0082FA',
  'Haas': '#000000',
  'Racing Bulls': '#FFFFFF',
  'Audi': '#8B8B8B',
  'Cadillac': '#FFFFFF',

  // Aliases / Fallbacks
  'Red Bull': '#E30118',
  'RB': '#FFFFFF',
  'Sauber': '#8B8B8B',
  'Kick Sauber': '#8B8B8B',

  // Lowercase variations
  'red_bull_racing': '#E30118',
  'mclaren': '#FF8700',
  'ferrari': '#DC0000',
  'mercedes': '#00D4BE',
  'williams': '#0082FA',
  'aston_martin': '#006F62',
  'alpine': '#0082FA',
  'haas': '#000000',
  'racing_bulls': '#FFFFFF',
  'audi': '#8B8B8B',
  'cadillac': '#FFFFFF'
}

export function getTeamColor(team: string): string {
  const normalized = team.toLowerCase().replace(/\s+/g, '_')
  return TEAM_COLORS[team] || TEAM_COLORS[normalized] || '#666666'
}
