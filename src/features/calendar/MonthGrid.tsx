import { isSameMonth, isToday } from 'date-fns'
import type { Profile } from '../../types/database'
import { toDateKey } from '../../utils/dateUtils'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function MonthGrid({
  days,
  monthAnchor,
  profiles,
  statusFor,
  selectedDateKey,
  onSelectDay,
}: {
  days: Date[]
  monthAnchor: Date
  profiles: Profile[]
  statusFor: (userId: string, dateKey: string) => 'home' | 'away'
  selectedDateKey: string
  onSelectDay: (dateKey: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="p-1.5 text-center text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const dateKey = toDateKey(date)
          const inMonth = isSameMonth(date, monthAnchor)
          const today = isToday(date)
          const selected = dateKey === selectedDateKey

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDay(dateKey)}
              className={`flex min-h-16 flex-col items-center gap-1 border-b border-r border-slate-100 p-1 text-left last:border-r-0 dark:border-slate-800 [&:nth-child(7n)]:border-r-0 ${
                selected
                  ? 'bg-teal-50 dark:bg-teal-950'
                  : inMonth
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50 dark:bg-slate-950'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  today
                    ? 'bg-teal-600 font-semibold text-white'
                    : inMonth
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                {date.getDate()}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {profiles.map((p) => {
                  const status = statusFor(p.id, dateKey)
                  return (
                    <span
                      key={p.id}
                      title={p.display_name}
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-medium ${
                        status === 'home'
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {p.display_name.charAt(0).toUpperCase()}
                    </span>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
