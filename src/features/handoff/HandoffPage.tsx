import { useState, type FormEvent } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useProfiles } from '../../hooks/useProfiles'
import { useHandoffNotes } from './useHandoffNotes'

export function HandoffPage() {
  const { unresolved, resolved, loading, addNote, setResolved, removeNote } = useHandoffNotes()
  const { nameFor } = useProfiles()
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setSubmitting(true)
    await addNote(draft.trim())
    setDraft('')
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Handoff notes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Quick heads-up for whoever's arriving next — not a maintenance request, just "worth knowing."
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex gap-2">
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

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading notes…</span>
        </div>
      ) : unresolved.length === 0 && resolved.length === 0 ? (
        <EmptyState title="No notes yet" hint="Leave something for the next crew before you go." />
      ) : (
        <>
          {unresolved.length > 0 && (
            <div className="flex flex-col gap-3">
              {unresolved.map((n) => (
                <Card key={n.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{n.note}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      from {nameFor(n.created_by)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setResolved(n.id, true)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Mark done
                    </button>
                    <button
                      onClick={() => removeNote(n.id)}
                      aria-label="Remove note"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Resolved
              </h2>
              <div className="flex flex-col gap-2">
                {resolved.map((n) => (
                  <Card key={n.id} className="flex items-start justify-between gap-3 opacity-60">
                    <p className="text-sm text-slate-600 line-through dark:text-slate-400">{n.note}</p>
                    <button
                      onClick={() => removeNote(n.id)}
                      aria-label="Remove note"
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
