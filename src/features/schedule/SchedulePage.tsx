import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/useAuth'
import { useProfiles } from '../../hooks/useProfiles'
import { dateRangeLabel, toDateKey } from '../../utils/dateUtils'
import { useDayStatus } from '../calendar/useDayStatus'
import { DayDetailPanel } from '../calendar/DayDetailPanel'
import { StayForm } from './StayForm'
import { useStays } from './useStays'

export function SchedulePage() {
  const { stays, loading, addStay, removeStay, overlapping, stayForDate } = useStays()
  const { nameFor } = useProfiles()
  const { user } = useAuth()
  const today = toDateKey(new Date())
  const todayAsDate = useMemo(() => [new Date()], [])
  const { profiles, statusFor, toggleOwnStatus } = useDayStatus(todayAsDate)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Schedule</h1>

      <DayDetailPanel
        dateKey={today}
        profiles={profiles}
        statusFor={statusFor}
        stay={stayForDate(today)}
        onToggleOwn={() => user && toggleOwnStatus(user.id, today)}
        onRemoveStay={removeStay}
      />

      <Card>
        <StayForm onAdd={addStay} checkOverlap={overlapping} />
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading schedule…</span>
        </div>
      ) : stays.length === 0 ? (
        <EmptyState title="Nothing on the schedule yet" hint="Add the first stay above." />
      ) : (
        <div className="flex flex-col gap-3">
          {stays.map((s) => {
            const isCurrent = s.start_date <= today && s.end_date >= today
            const isPast = s.end_date < today
            return (
              <Card
                key={s.id}
                className={`flex items-start justify-between gap-3 ${isPast ? 'opacity-50' : ''}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{s.label}</p>
                    {isCurrent && (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        Here now
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {dateRangeLabel(s.start_date, s.end_date)}
                  </p>
                  {s.notes && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.notes}</p>}
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    added by {nameFor(s.created_by)}
                  </p>
                </div>
                <button
                  onClick={() => removeStay(s.id)}
                  aria-label={`Remove ${s.label}`}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  ✕
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
