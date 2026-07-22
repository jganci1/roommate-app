import type { Profile } from '../../types/database'
import { DayCell } from './DayCell'

export function WeekView({
  days,
  profiles,
  statusFor,
  onToggleOwn,
}: {
  days: Date[]
  profiles: Profile[]
  statusFor: (userId: string, dateKey: string) => 'home' | 'away'
  onToggleOwn: (dateKey: string) => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {days.map((date) => (
        <DayCell
          key={date.toISOString()}
          date={date}
          profiles={profiles}
          statusFor={statusFor}
          onToggleOwn={onToggleOwn}
        />
      ))}
    </div>
  )
}
