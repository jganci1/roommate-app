import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/useAuth'
import { useProfiles } from '../../hooks/useProfiles'
import { AddSupplyItemForm } from './AddSupplyItemForm'
import { SupplyItemRow } from './SupplyItemRow'
import { useSupplyItems } from './useSupplyItems'

export function SupplyListPage() {
  const { user } = useAuth()
  const { items, loading, addItem, togglePurchased, removeItem } = useSupplyItems()
  const { nameFor } = useProfiles()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Supply list</h1>
      <Card>
        <AddSupplyItemForm onAdd={addItem} />
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading items…</span>
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No items yet" hint="Add something the house needs above." />
      ) : (
        <Card>
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <SupplyItemRow
                key={item.id}
                item={item}
                addedByName={nameFor(item.added_by)}
                onTogglePurchased={() => user && togglePurchased(item, user.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
