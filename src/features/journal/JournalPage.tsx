import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/useAuth'
import { useProfiles } from '../../hooks/useProfiles'
import { useJournal } from './useJournal'

export function JournalPage() {
  const { user } = useAuth()
  const { entries, loading, addEntry, removeEntry } = useJournal()
  const { nameFor } = useProfiles()
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setSubmitting(true)
    await addEntry(draft.trim())
    setDraft('')
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">House journal</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A running guestbook — leave a note about your stay for everyone else to enjoy later.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="How was your stay? Any favorite spots, sunsets, or stories worth remembering?"
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <Button type="submit" disabled={submitting || !draft.trim()} className="self-start">
            Post entry
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading journal…</span>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState title="The journal is empty" hint="Be the first to leave a note about your stay." />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{entry.body}</p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {nameFor(entry.created_by)} · {format(new Date(entry.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              {entry.created_by === user?.id && (
                <button
                  onClick={() => removeEntry(entry.id)}
                  aria-label="Remove entry"
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
