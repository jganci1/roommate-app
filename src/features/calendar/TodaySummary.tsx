import { format } from 'date-fns'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { useEvents } from '../events/useEvents'
import { daysUntil, eventDateLabel, nextOccurrence } from '../events/eventUtils'
import { useUpcomingBills } from '../bills/useUpcomingBills'
import { useSupplyItems } from '../supplies/useSupplyItems'

const UPCOMING_WINDOW_DAYS = 7

function relativeDayLabel(days: number): string {
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  return `in ${days} days`
}

export function TodaySummary() {
  const { events, loading: eventsLoading } = useEvents()
  const { bills, loading: billsLoading } = useUpcomingBills(UPCOMING_WINDOW_DAYS)
  const { items, loading: suppliesLoading } = useSupplyItems()

  const loading = eventsLoading || billsLoading || suppliesLoading
  const today = new Date()

  const upcomingEvents = events
    .map((e) => ({ event: e, occursOn: nextOccurrence(e, today) }))
    .filter(({ occursOn }) => daysUntil(occursOn, today) <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => a.occursOn.getTime() - b.occursOn.getTime())

  const todayEvents = upcomingEvents.filter(({ occursOn }) => daysUntil(occursOn, today) === 0)
  const laterEvents = upcomingEvents.filter(({ occursOn }) => daysUntil(occursOn, today) > 0)

  const neededSupplies = items.filter((i) => !i.purchased)

  const nothingGoingOn =
    todayEvents.length === 0 && laterEvents.length === 0 && bills.length === 0 && neededSupplies.length === 0

  if (loading) {
    return (
      <Card className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-slate-500 dark:text-slate-400">Loading today…</span>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Today · {format(today, 'EEEE, MMMM d')}
      </h2>

      {nothingGoingOn ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Nothing on the radar for the next {UPCOMING_WINDOW_DAYS} days.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {todayEvents.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {todayEvents.map(({ event }) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                >
                  <span>{event.recurs_yearly ? '🎂' : '🎉'}</span>
                  {event.title}
                  <span className="font-normal text-amber-600 dark:text-amber-400">— today!</span>
                </div>
              ))}
            </div>
          )}

          {laterEvents.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                Upcoming events
              </p>
              <ul className="flex flex-col gap-1">
                {laterEvents.map(({ event, occursOn }) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span>
                      {event.recurs_yearly && <span className="mr-1">🎂</span>}
                      {event.title}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {eventDateLabel(event)} · {relativeDayLabel(daysUntil(occursOn, today))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bills.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                Bills due soon
              </p>
              <ul className="flex flex-col gap-1">
                {bills.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span>{b.category}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      ${Number(b.amount).toFixed(2)} ·{' '}
                      {format(new Date(`${b.due_date}T00:00:00`), 'MMM d')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {neededSupplies.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                Supplies still needed
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {neededSupplies
                  .slice(0, 5)
                  .map((i) => i.name)
                  .join(', ')}
                {neededSupplies.length > 5 && ` +${neededSupplies.length - 5} more`}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
