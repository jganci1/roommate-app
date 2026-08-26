import { useEffect, useState } from 'react'

export interface TideEvent {
  time: Date
  type: 'H' | 'L'
  heightFt: number
}

interface TideData {
  stationName: string
  events: TideEvent[]
}

interface TideState {
  status: 'loading' | 'ready' | 'error' | 'unavailable'
  data: TideData | null
  errorMessage: string | null
}

interface Station {
  id: string
  name: string
  lat: number
  lng: number
}

// NOAA only has tide stations along US coasts/territories/Great Lakes, and the
// nearest one can be a real distance away for households that aren't right on
// the water — beyond this radius, treat tides as not applicable rather than
// showing a wildly-off station.
const MAX_STATION_DISTANCE_MILES = 60

// The station list is ~2MB (NOAA's metadata API has no way to filter it
// server-side), so it's fetched once per session and reused, not once per
// component mount.
let stationsPromise: Promise<Station[]> | null = null

function loadStations(): Promise<Station[]> {
  if (!stationsPromise) {
    stationsPromise = fetch(
      'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions',
    )
      .then((res) => {
        if (!res.ok) throw new Error('Station list unavailable')
        return res.json()
      })
      .then((json) => json.stations as Station[])
      .catch((err) => {
        stationsPromise = null
        throw err
      })
  }
  return stationsPromise
}

function milesBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusMiles = 3958.8
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a))
}

function findNearestStation(stations: Station[], lat: number, lon: number) {
  let nearest: Station | null = null
  let nearestDistance = Infinity
  for (const station of stations) {
    const distance = milesBetween(lat, lon, station.lat, station.lng)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = station
    }
  }
  return nearest ? { station: nearest, distance: nearestDistance } : null
}

const pad = (n: number) => String(n).padStart(2, '0')
const asNoaaDate = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`

export function useTides(coords: { latitude: number; longitude: number } | null) {
  const [state, setState] = useState<TideState>({
    status: 'loading',
    data: null,
    errorMessage: null,
  })

  useEffect(() => {
    if (!coords) return
    let cancelled = false
    setState({ status: 'loading', data: null, errorMessage: null })

    loadStations()
      .then((stations) => {
        if (cancelled) return null
        const nearest = findNearestStation(stations, coords.latitude, coords.longitude)
        if (!nearest || nearest.distance > MAX_STATION_DISTANCE_MILES) {
          setState({ status: 'unavailable', data: null, errorMessage: null })
          return null
        }
        return nearest.station
      })
      .then((station) => {
        if (cancelled || !station) return

        const today = new Date()
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        const params = new URLSearchParams({
          begin_date: asNoaaDate(today),
          end_date: asNoaaDate(tomorrow),
          product: 'predictions',
          datum: 'mllw',
          interval: 'hilo',
          format: 'json',
          units: 'english',
          time_zone: 'lst_ldt',
          station: station.id,
        })

        return fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params.toString()}`)
          .then((res) => {
            if (!res.ok) throw new Error('Tide service unavailable')
            return res.json()
          })
          .then((json) => {
            if (cancelled) return
            if (json.error || !json.predictions) {
              throw new Error(json.error?.message ?? 'No tide predictions for this station')
            }
            const events: TideEvent[] = json.predictions.map(
              (p: { t: string; v: string; type: 'H' | 'L' }) => ({
                time: new Date(p.t.replace(' ', 'T')),
                type: p.type,
                heightFt: Number(p.v),
              }),
            )
            setState({ status: 'ready', errorMessage: null, data: { stationName: station.name, events } })
          })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ status: 'error', data: null, errorMessage: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [coords])

  return state
}
