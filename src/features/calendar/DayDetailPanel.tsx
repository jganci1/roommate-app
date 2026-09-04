import { format } from 'date-fns'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../auth/useAuth'
import type { Profile, Stay } from '../../types/database'

export function DayDetailPanel({
  dateKey,
  profiles,
  statusFor,
  stay,
  onToggleOwn,
  onRemoveStay,
}: {
  dateKey: string
  profiles: Profile[]
  statusFor: (userId: string, dateKey: string) => 'home' | 'away'
  stay?: Stay | null
  onToggleOwn: () => void
  onRemoveStay?: (id: string) => void
}) {
  const { user } = useAuth()

  return (
    <Card>
      <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {format(new Date(`${dateKey}T00:00:00`), 'EEEE, MMMM d')}
      </h2>
      {stay && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            🏖️ {stay.label} are staying
          </p>
          {onRemoveStay && (
            <button
              onClick={() => onRemoveStay(stay.id)}
              className="shrink-0 text-xs font-medium text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      )}
      <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {profiles.map((p: Profile) => {
          const status = statusFor(p.id, dateKey)
          const isMe = p.id === user?.id
          return (
            <li key={p.id} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-slate-800 dark:text-slate-100">
                {p.display_name}
                {isMe && <span className="text-slate-400"> (you)</span>}
              </span>
              {isMe ? (
                <Button variant={status === 'home' ? 'secondary' : 'primary'} onClick={onToggleOwn}>
                  {status === 'home' ? 'Mark away' : 'Mark home'}
                </Button>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    status === 'home'
                      ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {status === 'home' ? 'Home' : 'Away'}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
