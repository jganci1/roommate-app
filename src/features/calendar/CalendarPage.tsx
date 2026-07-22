import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/useAuth'
import { getWeekDays, shiftWeek, weekRangeLabel } from '../../utils/dateUtils'
import { useDayStatus } from './useDayStatus'
import { WeekView } from './WeekView'

export function CalendarPage() {
  const [anchor, setAnchor] = useState(new Date())
  const { user } = useAuth()
  const days = useMemo(() => getWeekDays(anchor), [anchor])
  const { profiles, loading, statusFor, toggleOwnStatus } = useDayStatus(days)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {weekRangeLabel(days)}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAnchor((a) => shiftWeek(a, -1))}>
            ← Prev
          </Button>
          <Button variant="secondary" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button variant="secondary" onClick={() => setAnchor((a) => shiftWeek(a, 1))}>
            Next →
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading calendar…</span>
        </div>
      ) : (
        <WeekView
          days={days}
          profiles={profiles}
          statusFor={statusFor}
          onToggleOwn={(dateKey) => user && toggleOwnStatus(user.id, dateKey)}
        />
      )}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Tap your own tile to mark yourself home or away for that day.
      </p>
    </div>
  )
}
