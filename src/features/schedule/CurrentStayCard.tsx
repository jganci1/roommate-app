import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { dateRangeLabel, shortDateLabel } from '../../utils/dateUtils'
import { useStays } from './useStays'

export function CurrentStayCard() {
  const { loading, currentStay, nextStay } = useStays()

  if (loading) return null

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          {currentStay ? (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">Here now</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{currentStay.label}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                through {shortDateLabel(currentStay.end_date)}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              No one's scheduled at the house right now
            </p>
          )}
          {nextStay && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Next up: <span className="font-medium text-slate-700 dark:text-slate-200">{nextStay.label}</span>,{' '}
              {dateRangeLabel(nextStay.start_date, nextStay.end_date)}
            </p>
          )}
        </div>
        <span className="text-3xl" aria-hidden="true">
          🏖️
        </span>
      </div>
      <Link
        to="/schedule"
        className="mt-3 inline-block text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
      >
        View full schedule →
      </Link>
    </Card>
  )
}
