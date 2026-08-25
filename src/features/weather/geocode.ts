export interface GeocodeResult {
  latitude: number
  longitude: number
  label: string
}

// Open-Meteo's free geocoding API (no key needed) — resolves a place
// name/city/zip/address to coordinates. City/zip-level accuracy is plenty
// for weather purposes.
export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  const params = new URLSearchParams({ name: query, count: '1', language: 'en', format: 'json' })
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`)
  if (!res.ok) throw new Error('Geocoding service unavailable')
  const json = await res.json()
  const match = json.results?.[0]
  if (!match) throw new Error(`Couldn't find a location for "${query}". Try a city and state/zip.`)

  const parts = [match.name, match.admin1, match.country].filter(Boolean)
  return {
    latitude: match.latitude,
    longitude: match.longitude,
    label: parts.join(', '),
  }
}
