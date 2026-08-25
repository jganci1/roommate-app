import { useEffect, useState } from 'react'

interface WeatherData {
  temperature: number
  apparentTemperature: number
  weatherCode: number
  daily: { date: string; max: number; min: number; weatherCode: number }[]
}

interface WeatherState {
  status: 'loading' | 'ready' | 'error'
  data: WeatherData | null
  errorMessage: string | null
}

export function useWeather(coords: { latitude: number; longitude: number } | null) {
  const [state, setState] = useState<WeatherState>({
    status: 'loading',
    data: null,
    errorMessage: null,
  })

  useEffect(() => {
    if (!coords) return
    let cancelled = false
    setState({ status: 'loading', data: null, errorMessage: null })

    const params = new URLSearchParams({
      latitude: String(coords.latitude),
      longitude: String(coords.longitude),
      current: 'temperature_2m,apparent_temperature,weather_code',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      temperature_unit: 'fahrenheit',
      timezone: 'auto',
      forecast_days: '5',
    })

    fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Weather service unavailable')
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setState({
          status: 'ready',
          errorMessage: null,
          data: {
            temperature: json.current.temperature_2m,
            apparentTemperature: json.current.apparent_temperature,
            weatherCode: json.current.weather_code,
            daily: (json.daily.time as string[]).map((date, i) => ({
              date,
              max: json.daily.temperature_2m_max[i],
              min: json.daily.temperature_2m_min[i],
              weatherCode: json.daily.weather_code[i],
            })),
          },
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
