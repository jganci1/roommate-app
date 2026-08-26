import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useHandoffNotes } from './useHandoffNotes'

export function HandoffNotesCard() {
  const { unresolved, loading, addNote, setResolved } = useHandoffNotes()
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setSubmitting(true)
    await addNote(draft.trim())
    setDraft('')
    setSubmitting(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Heads up for the next crew
        </h2>
        <Link to="/handoff" className="text-xs font-medium text-teal-600 hover:underline dark:text-teal-400">
          View all
        </Link>
      </div>

      {unresolved.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Nothing to flag right now.</p>
      ) : (
        <ul className="mt-2 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {unresolved.slice(0, 4).map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 py-2">
              <p className="text-sm text-slate-700 dark:text-slate-200">{n.note}</p>
              <button
                onClick={() => setResolved(n.id, true)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Done
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Low on propane, ants near the deck…"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <Button type="submit" disabled={submitting || !draft.trim()}>
          Add
        </Button>
      </form>
    </Card>
  )
}
