import type { SupplyItem } from '../../types/database'

export function SupplyItemRow({
  item,
  addedByName,
  onTogglePurchased,
  onRemove,
}: {
  item: SupplyItem
  addedByName: string
  onTogglePurchased: () => void
  onRemove: () => void
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <label className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={onTogglePurchased}
          className="h-4 w-4 shrink-0 accent-teal-600"
        />
        <span className="min-w-0">
          <span
            className={`block truncate text-sm ${
              item.purchased
                ? 'text-slate-400 line-through dark:text-slate-600'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {item.name} {item.quantity > 1 && <span className="text-slate-400">× {item.quantity}</span>}
          </span>
          <span className="block text-xs text-slate-400 dark:text-slate-500">
            added by {addedByName}
          </span>
        </span>
      </label>
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        ✕
      </button>
    </li>
  )
}
