import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import type { ContactInput } from './useContacts'

const inputClass =
  'rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

export function ContactForm({ onAdd }: { onAdd: (input: ContactInput) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', role: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    await onAdd({
      name: form.name.trim(),
      role: form.role.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
    })
    setForm({ name: '', role: '', phone: '', email: '', notes: '' })
    setSubmitting(false)
    setOpen(false)
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="w-full">
        + Add contact
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className={inputClass}
      />
      <input
        placeholder="Role (e.g. Property manager)"
        value={form.role}
        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
        className={inputClass}
      />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        className={inputClass}
      />
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className={inputClass}
      />
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        className={inputClass}
        rows={2}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || !form.name.trim()} className="flex-1">
          Save contact
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
