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

// Normalize circuit name to SVG filename
export function normalizeCircuitName(name: string | undefined): string {
  if (!name) return ''

  const circuitMap: Record<string, string> = {
    'bahrain international circuit': 'bahrain',
    'jeddah corniche circuit': 'jeddah',
    'miami international autodrome': 'miami',
    'circuit de monaco': 'monaco',
    'circuit de barcelona-catalunya': 'barcelona',
    'red bull ring': 'austria',
    'silverstone circuit': 'silverstone',
    'hungaroring': 'hungary',
    'spa-francorchamps': 'spa',
    'autodromo di monza': 'monza',
    'marina bay street circuit': 'singapore',
    'suzuka circuit': 'suzuka',
    'lusail international circuit': 'qatar',
    'circuit of the americas': 'austin',
    'autodromo hermanos rodriguez': 'mexico-city',
    'autodromo jose maria guizado': 'sao-paulo',
    'yas marina circuit': 'abu-dhabi',
    'albert park circuit': 'melbourne',
    'circuit gilles villeneuve': 'montreal',
    'circuit zandvoort': 'zandvoort',
    'baku city circuit': 'baku',
    'autodromo internazionale enzo e dino ferrari': 'imola'
  }

  const normalized = name.toLowerCase().trim()

  if (circuitMap[normalized]) return circuitMap[normalized]

  const firstWord = normalized.split(/\s+/)[0]
  const partial = Object.entries(circuitMap).find(([key]) =>
    key.split(/\s+/)[0] === firstWord
  )
  if (partial) return partial[1]

  return firstWord || normalized.replace(/\s+/g, '-')
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
