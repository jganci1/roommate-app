import { Card } from '../../components/ui/Card'

export function MonthTotal({ total, count }: { total: number; count: number }) {
  return (
    <Card className="flex items-center justify-between">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {count} {count === 1 ? 'entry' : 'entries'} this month
      </span>
      <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        ${total.toFixed(2)}
      </span>
    </Card>
  )
}
