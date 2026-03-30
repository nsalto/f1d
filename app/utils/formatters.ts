export function formatLapTime(seconds: number | null): string {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins}:${secs.toFixed(3).padStart(6, '0')}`
  }
  return secs.toFixed(3)
}

export function formatGap(gap: number | null): string {
  if (!gap) return '-'
  if (gap > 0) return `+${gap.toFixed(3)}`
  return gap.toFixed(3)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short'
  })
}

export function formatDateTime(dateStr: string, timeStr?: string): Date {
  if (timeStr) {
    return new Date(`${dateStr}T${timeStr}`)
  }
  return new Date(dateStr)
}

export function getCountryFlag(nationality: string): string {
  const flags: Record<string, string> = {
    'Dutch': '🇳🇱', 'British': '🇬🇧', 'Spanish': '🇪🇸', 'Monegasque': '🇲🇨',
    'Australian': '🇦🇺', 'Mexican': '🇲🇽', 'French': '🇫🇷', 'Canadian': '🇨🇦',
    'German': '🇩🇪', 'Thai': '🇹🇭', 'Japanese': '🇯🇵', 'Chinese': '🇨🇳',
    'Finnish': '🇫🇮', 'American': '🇺🇸', 'Danish': '🇩🇰', 'Italian': '🇮🇹',
    'Argentine': '🇦🇷', 'Brazilian': '🇧🇷', 'New Zealander': '🇳🇿',
    'Austrian': '🇦🇹', 'Belgian': '🇧🇪', 'Swiss': '🇨🇭', 'Swedish': '🇸🇪',
    'UK': '🇬🇧', 'USA': '🇺🇸', 'UAE': '🇦🇪', 'Bahrain': '🇧🇭',
    'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺', 'Japan': '🇯🇵',
    'China': '🇨🇳', 'USA Miami': '🇺🇸', 'Monaco': '🇲🇨', 'Spain': '🇪🇸',
    'Canada': '🇨🇦', 'Austria': '🇦🇹', 'Hungary': '🇭🇺', 'Belgium': '🇧🇪',
    'Netherlands': '🇳🇱', 'Italy': '🇮🇹', 'Azerbaijan': '🇦🇿',
    'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷',
    'Qatar': '🇶🇦', 'Abu Dhabi': '🇦🇪', 'Las Vegas': '🇺🇸'
  }
  return flags[nationality] || '🏁'
}

export function getCompoundColor(compound: string): string {
  const colors: Record<string, string> = {
    SOFT: '#FF3333',
    MEDIUM: '#FFC300',
    HARD: '#FFFFFF',
    INTERMEDIATE: '#47C340',
    WET: '#0072C6'
  }
  return colors[compound?.toUpperCase()] || '#666666'
}
