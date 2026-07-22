import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useGeolocation } from './useGeolocation'
import { useWeather } from './useWeather'
import { describeWeatherCode } from './weatherCodes'

const dayLabel = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })

export function WeatherWidget() {
  const geo = useGeolocation()
  const weather = useWeather(geo.coords)

  if (geo.status === 'idle' || geo.status === 'loading') {
    return (
      <Card className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-slate-500 dark:text-slate-400">Getting your location…</span>
      </Card>
    )
  }

  if (geo.status === 'denied' || geo.status === 'error') {
    return (
      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Weather unavailable
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {geo.status === 'denied'
              ? 'Location access was denied. Enable it in your browser/phone settings to see local weather.'
              : geo.errorMessage}
          </p>
        </div>
        <Button variant="secondary" onClick={geo.retry}>
          Retry
        </Button>
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
      <Card className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Couldn't load weather{weather.errorMessage ? `: ${weather.errorMessage}` : '.'}
        </p>
        <Button variant="secondary" onClick={geo.retry}>
          Retry
        </Button>
      </Card>
    )
  }

  const current = describeWeatherCode(weather.data.weatherCode)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Weather near you</p>
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
