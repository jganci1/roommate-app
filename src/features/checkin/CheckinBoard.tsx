import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/useAuth'
import { useCheckinStatus } from './useCheckinStatus'

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

export function CheckinBoard() {
  const { user } = useAuth()
  const { profiles, loading, setStatus } = useCheckinStatus()

  if (loading) {
    return (
      <Card className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-slate-500 dark:text-slate-400">Loading roommates…</span>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Who's home
      </h2>
      <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {profiles.map((p) => {
          const isMe = p.id === user?.id
          return (
            <li key={p.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${p.is_home ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {p.display_name}
                    {isMe && <span className="text-slate-400"> (you)</span>}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {p.is_home ? 'Checked in' : 'Checked out'} · {timeLabel(p.status_updated_at)}
                  </p>
                </div>
              </div>
              {isMe && (
                <Button
                  variant={p.is_home ? 'secondary' : 'primary'}
                  onClick={() => setStatus(p.id, !p.is_home)}
                >
                  {p.is_home ? 'Check out' : 'Check in'}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
