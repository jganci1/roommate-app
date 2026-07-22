import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { monthKey, monthLabel } from '../../utils/dateUtils'
import { BillForm } from './BillForm'
import { MonthTotal } from './MonthTotal'
import { useBills } from './useBills'

function shiftMonth(key: string, delta: number): string {
  const d = new Date(`${key}T00:00:00`)
  d.setMonth(d.getMonth() + delta)
  return monthKey(d)
}

export function BillsPage() {
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()))
  const { bills, loading, addBill, removeBill, total } = useBills(selectedMonth)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {monthLabel(selectedMonth)}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}>
            ← Prev
          </Button>
          <Button variant="secondary" onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}>
            Next →
          </Button>
        </div>
      </div>

      <Card>
        <BillForm onAdd={addBill} />
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading bills…</span>
        </div>
      ) : bills.length === 0 ? (
        <EmptyState title="No costs logged for this month" hint="Add rent, internet, or utility costs above." />
      ) : (
        <>
          <MonthTotal total={total} count={bills.length} />
          <Card>
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {bills.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {b.category}
                    </p>
                    {b.notes && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">{b.notes}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      ${Number(b.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeBill(b.id)}
                      aria-label={`Remove ${b.category}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}
