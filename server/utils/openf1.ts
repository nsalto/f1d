const BASE_URL = 'https://api.openf1.org/v1'

export async function fetchOpenF1<T = any>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const query = params
    ? '?' + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString()
    : ''
  return $fetch<T>(`${BASE_URL}/${endpoint}${query}`)
}
