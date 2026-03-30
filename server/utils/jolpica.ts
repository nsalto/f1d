const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

export async function fetchJolpica<T = any>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`
  const data = await $fetch<{ MRData: T }>(url)
  return data.MRData
}
