export const TEAM_COLORS: Record<string, string> = {
  'Red Bull': '#3671C6',
  'McLaren': '#FF8000',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'RB': '#6692FF',
  'Kick Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD',
  // Aliases
  'red_bull': '#3671C6',
  'mclaren': '#FF8000',
  'ferrari': '#E8002D',
  'mercedes': '#27F4D2',
  'aston_martin': '#229971',
  'alpine': '#FF87BC',
  'williams': '#64C4FF',
  'rb': '#6692FF',
  'sauber': '#52E252',
  'haas': '#B6BABD'
}

export function getTeamColor(team: string): string {
  const normalized = team.toLowerCase().replace(/\s+/g, '_')
  return TEAM_COLORS[team] || TEAM_COLORS[normalized] || '#666666'
}
