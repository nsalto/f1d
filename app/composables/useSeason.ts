export function useSeason() {
  const currentSeason = String(new Date().getFullYear())
  return { currentSeason }
}
