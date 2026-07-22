import { format, isToday } from 'date-fns'
import { useAuth } from '../../auth/useAuth'
import { Card } from '../../components/ui/Card'
import type { Profile } from '../../types/database'
import { toDateKey } from '../../utils/dateUtils'

export function DayCell({
  date,
  profiles,
  statusFor,
  onToggleOwn,
}: {
  date: Date
  profiles: Profile[]
  statusFor: (userId: string, dateKey: string) => 'home' | 'away'
  onToggleOwn: (dateKey: string) => void
}) {
  const { user } = useAuth()
  const dateKey = toDateKey(date)
  const today = isToday(date)

  return (
    <Card
      className={`w-40 shrink-0 ${today ? 'ring-2 ring-teal-500' : ''}`}
    >
      <p className="text-xs font-semibold uppercase text-slate-400">{format(date, 'EEE')}</p>
      <p className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
        {format(date, 'd')}
      </p>
      <ul className="flex flex-col gap-1.5">
        {profiles.map((p) => {
          const status = statusFor(p.id, dateKey)
          const isMe = p.id === user?.id
          return (
            <li key={p.id}>
              <button
                disabled={!isMe}
                onClick={() => onToggleOwn(dateKey)}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs ${
                  status === 'home'
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                } ${isMe ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              >
                <span className="truncate">{p.display_name}</span>
                <span>{status === 'home' ? '🏠' : '✈️'}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
