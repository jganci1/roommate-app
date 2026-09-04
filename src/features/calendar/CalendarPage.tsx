import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/useAuth'
import { getMonthGridDays, monthYearLabel, shiftMonth, toDateKey } from '../../utils/dateUtils'
import { useDayStatus } from './useDayStatus'
import { MonthGrid } from './MonthGrid'
import { DayDetailPanel } from './DayDetailPanel'
import { TodaySummary } from './TodaySummary'
import { useStays } from '../schedule/useStays'

export function CalendarPage() {
  const [monthAnchor, setMonthAnchor] = useState(new Date())
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(new Date()))
  const { user } = useAuth()
  const days = useMemo(() => getMonthGridDays(monthAnchor), [monthAnchor])
  const { profiles, loading, statusFor, toggleOwnStatus } = useDayStatus(days)
  const { stays, stayForDate } = useStays()

  const goToMonth = (next: Date) => {
    setMonthAnchor(next)
    setSelectedDateKey(toDateKey(next))
  }

  return (
    <div className="flex flex-col gap-4">
      <TodaySummary />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {monthYearLabel(monthAnchor)}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => goToMonth(shiftMonth(monthAnchor, -1))}>
            ← Prev
          </Button>
          <Button variant="secondary" onClick={() => goToMonth(new Date())}>
            Today
          </Button>
          <Button variant="secondary" onClick={() => goToMonth(shiftMonth(monthAnchor, 1))}>
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
        <>
          <MonthGrid
            days={days}
            monthAnchor={monthAnchor}
            profiles={profiles}
            statusFor={statusFor}
            stays={stays}
            selectedDateKey={selectedDateKey}
            onSelectDay={setSelectedDateKey}
          />
          <DayDetailPanel
            dateKey={selectedDateKey}
            profiles={profiles}
            statusFor={statusFor}
            stay={stayForDate(selectedDateKey)}
            onToggleOwn={() => user && toggleOwnStatus(user.id, selectedDateKey)}
          />
        </>
      )}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Tap a day to see who's home, then use the button to mark yourself home or away.
      </p>
    </div>
  )
}
