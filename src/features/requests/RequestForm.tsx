import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'

export function RequestForm({
  onAdd,
}: {
  onAdd: (title: string, description: string) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    await onAdd(title.trim(), description.trim())
    setTitle('')
    setDescription('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        placeholder="What do you need? (e.g. Fix leaky faucet)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <textarea
        placeholder="Details (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <Button type="submit" disabled={submitting || !title.trim()}>
        Submit request
      </Button>
    </form>
  )
}
