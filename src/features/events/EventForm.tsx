import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { toDateKey } from '../../utils/dateUtils'
import type { EventInput } from './useEvents'

export function EventForm({ onAdd }: { onAdd: (input: EventInput) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toDateKey(new Date()))
  const [recursYearly, setRecursYearly] = useState(false)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    setSubmitting(true)
    await onAdd({
      title: title.trim(),
      event_date: date,
      recurs_yearly: recursYearly,
      notes: notes.trim() || null,
    })
    setTitle('')
    setNotes('')
    setRecursYearly(false)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        placeholder="Event name (e.g. Sarah's birthday)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={recursYearly}
          onChange={(e) => setRecursYearly(e.target.checked)}
          className="h-4 w-4 accent-teal-600"
        />
        Repeats every year (birthdays, anniversaries)
      </label>
      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <Button type="submit" disabled={submitting || !title.trim() || !date}>
        Add event
      </Button>
    </form>
  )
}
