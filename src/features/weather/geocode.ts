export interface GeocodeResult {
  latitude: number
  longitude: number
  label: string
}

// Open-Meteo's free geocoding API (no key needed) — resolves a place
// name/city/zip to coordinates. It matches place names only, so a full
// street address (with a house number) never matches directly — city/zip-
// level accuracy is plenty for weather anyway.
async function lookupPlace(query: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({ name: query, count: '1', language: 'en', format: 'json' })
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`)
  if (!res.ok) throw new Error('Geocoding service unavailable')
  const json = await res.json()
  const match = json.results?.[0]
  if (!match) return null

  const parts = [match.name, match.admin1, match.country].filter(Boolean)
  return {
    latitude: match.latitude,
    longitude: match.longitude,
    label: parts.join(', '),
  }
}

export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  const direct = await lookupPlace(query)
  if (direct) return direct

  // A full street address (e.g. "330 Clift Drive, Laguna Beach, CA") won't
  // match as a place name — retry with everything after the first comma,
  // which is usually just the city/state/zip.
  const commaIndex = query.indexOf(',')
  if (commaIndex !== -1) {
    const cityPortion = query.slice(commaIndex + 1).trim()
    const fallback = cityPortion && (await lookupPlace(cityPortion))
    if (fallback) return fallback
  }

  throw new Error(
    `Couldn't find a location for "${query}". Try adding a city and state/zip, e.g. "330 Clift Drive, Laguna Beach, CA".`,
  )
}
