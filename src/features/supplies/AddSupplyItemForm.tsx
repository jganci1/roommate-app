import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'

export function AddSupplyItemForm({
  onAdd,
}: {
  onAdd: (name: string, quantity: number) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    await onAdd(name.trim(), quantity)
    setName('')
    setQuantity(1)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        className="w-16 rounded-xl border border-slate-300 px-2 py-2 text-center text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <Button type="submit" disabled={submitting || !name.trim()}>
        Add
      </Button>
    </form>
  )
}
