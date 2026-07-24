import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { EventForm } from './EventForm'
import { useEvents } from './useEvents'
import { daysUntil, eventDateLabel, nextOccurrence } from './eventUtils'

export function EventsPage() {
  const { events, loading, addEvent, removeEvent } = useEvents()
  const today = new Date()

  const sorted = [...events].sort(
    (a, b) => nextOccurrence(a, today).getTime() - nextOccurrence(b, today).getTime(),
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Events</h1>
      <Card>
        <EventForm onAdd={addEvent} />
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading events…</span>
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState title="No events yet" hint="Add a birthday, party, or anything else worth tracking." />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((e) => {
            const days = daysUntil(nextOccurrence(e, today), today)
            return (
              <Card key={e.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {e.title}
                    {e.recurs_yearly && <span className="ml-1 text-slate-400">🎂</span>}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {eventDateLabel(e)} ·{' '}
                    {days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}
                  </p>
                  {e.notes && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{e.notes}</p>}
                </div>
                <button
                  onClick={() => removeEvent(e.id)}
                  aria-label={`Remove ${e.title}`}
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
