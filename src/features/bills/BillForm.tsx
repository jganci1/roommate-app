import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'

const categories = ['Rent', 'Electricity', 'Internet', 'Water', 'Gas', 'Trash', 'Other']

export function BillForm({
  onAdd,
}: {
  onAdd: (category: string, amount: number, notes: string, dueDate: string | null) => Promise<void>
}) {
  const [category, setCategory] = useState(categories[0])
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value < 0) return
    setSubmitting(true)
    await onAdd(category, value, notes.trim(), dueDate || null)
    setAmount('')
    setDueDate('')
    setNotes('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        Due date (optional)
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <Button type="submit" disabled={submitting || !amount}>
        Add cost
      </Button>
    </form>
  )
}
