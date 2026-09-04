import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import type { StayInput } from './useStays'

export function StayForm({
  onAdd,
  checkOverlap,
}: {
  onAdd: (input: StayInput) => Promise<void>
  checkOverlap: (start: string, end: string) => { label: string; start_date: string; end_date: string }[]
}) {
  const [label, setLabel] = useState('')
  // Deliberately blank, not defaulted to today — a form submitted without
  // touching the date fields used to silently create a one-day "here now"
  // stay for today, which is confusing for something meant to be scheduled.
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const conflicts = startDate && endDate && startDate <= endDate ? checkOverlap(startDate, endDate) : []

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!label.trim() || !startDate || !endDate || startDate > endDate) return
    setSubmitting(true)
    await onAdd({
      label: label.trim(),
      start_date: startDate,
      end_date: endDate,
      notes: notes.trim() || null,
    })
    setLabel('')
    setNotes('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        placeholder="Who's staying? (e.g. Tony & Natalie)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          From
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          Through
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
      </div>
      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      {startDate && endDate && startDate > endDate && (
        <p className="text-sm text-red-600 dark:text-red-400">End date must be on or after the start date.</p>
      )}
      {conflicts.length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Overlaps with {conflicts.map((c) => c.label).join(', ')} — you can still save if that's intentional.
        </p>
      )}
      <Button type="submit" disabled={submitting || !label.trim() || !startDate || !endDate || startDate > endDate}>
        Add to schedule
      </Button>
    </form>
  )
}
