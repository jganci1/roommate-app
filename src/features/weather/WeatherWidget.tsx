import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/useAuth'
import { useWeather } from './useWeather'
import { describeWeatherCode } from './weatherCodes'

const dayLabel = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })

export function WeatherWidget() {
  const { household } = useAuth()
  const coords = useMemo(
    () =>
      household?.latitude != null && household?.longitude != null
        ? { latitude: household.latitude, longitude: household.longitude }
        : null,
    [household],
  )
  const weather = useWeather(coords)

  if (!coords) {
    return (
      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Weather unavailable
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set the house address to see local weather.
          </p>
        </div>
        <Link to="/household">
          <Button variant="secondary">Set address</Button>
        </Link>
      </Card>
    )
  }

  if (weather.status === 'loading') {
    return (
      <Card className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-slate-500 dark:text-slate-400">Loading weather…</span>
      </Card>
    )
  }

  if (weather.status === 'error' || !weather.data) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Couldn't load weather{weather.errorMessage ? `: ${weather.errorMessage}` : '.'}
        </p>
      </Card>
    )
  }

  const current = describeWeatherCode(weather.data.weatherCode)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weather at {household?.address ?? 'the house'}
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
            {Math.round(weather.data.temperature)}°F
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {current.label} · feels like {Math.round(weather.data.apparentTemperature)}°F
          </p>
        </div>
        <span className="text-5xl" aria-hidden="true">
          {current.icon}
        </span>
      </div>
      <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        {weather.data.daily.slice(0, 5).map((day) => {
          const info = describeWeatherCode(day.weatherCode)
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">{dayLabel(day.date)}</span>
              <span aria-hidden="true">{info.icon}</span>
              <span className="text-slate-700 dark:text-slate-300">{Math.round(day.max)}°</span>
              <span className="text-slate-400 dark:text-slate-500">{Math.round(day.min)}°</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
