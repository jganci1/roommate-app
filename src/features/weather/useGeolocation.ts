import { useCallback, useEffect, useState } from 'react'

type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error'

interface GeoState {
  status: GeoStatus
  coords: { latitude: number; longitude: number } | null
  errorMessage: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    status: 'idle',
    coords: null,
    errorMessage: null,
  })

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', coords: null, errorMessage: 'Geolocation is not supported on this device.' })
      return
    }
    setState((s) => ({ ...s, status: 'loading' }))
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'granted',
          coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
          errorMessage: null,
        })
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error',
          coords: null,
          errorMessage: err.message,
        })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    )
  }, [])

  useEffect(() => {
    request()
  }, [request])

  return { ...state, retry: request }
}
