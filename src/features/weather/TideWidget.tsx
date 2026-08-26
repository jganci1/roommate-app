import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../auth/useAuth'
import { useTides } from './useTides'

const timeLabel = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

export function TideWidget() {
  const { household } = useAuth()
  const coords = useMemo(
    () =>
      household?.latitude != null && household?.longitude != null
        ? { latitude: household.latitude, longitude: household.longitude }
        : null,
    [household],
  )
  const tides = useTides(coords)

  // Tides are a bonus, not core — stay silent while loading and for
  // households nowhere near a coast, rather than showing a loading flicker
  // or an error for something most households will never have.
  if (tides.status !== 'ready' || !tides.data) return null

  const now = new Date()
  const next = tides.data.events.find((event) => event.time > now) ?? tides.data.events.at(-1)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tides near {tides.data.stationName}</p>
          {next && (
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Next: {next.type === 'H' ? 'High' : 'Low'} tide at {timeLabel(next.time)}
            </p>
          )}
        </div>
        <span className="text-3xl" aria-hidden="true">
          🌊
        </span>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto border-t border-slate-100 pt-3 dark:border-slate-800">
        {tides.data.events.map((event) => {
          const isPast = event.time <= now
          return (
            <div
              key={event.time.toISOString()}
              className={`flex flex-none flex-col items-center gap-1 text-xs ${isPast ? 'opacity-40' : ''}`}
            >
              <span className="text-slate-500 dark:text-slate-400">
                {event.type === 'H' ? '▲ High' : '▼ Low'}
              </span>
              <span className="text-slate-700 dark:text-slate-300">{timeLabel(event.time)}</span>
              <span className="text-slate-400 dark:text-slate-500">{event.heightFt.toFixed(1)} ft</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
