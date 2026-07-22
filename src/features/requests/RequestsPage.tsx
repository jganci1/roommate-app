import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useProfiles } from '../../hooks/useProfiles'
import type { RequestStatus } from '../../types/database'
import { RequestForm } from './RequestForm'
import { useRequests } from './useRequests'

const statusOrder: RequestStatus[] = ['open', 'in_progress', 'done']

export function RequestsPage() {
  const { requests, loading, addRequest, setStatus } = useRequests()
  const { nameFor } = useProfiles()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Requests</h1>
      <Card>
        <RequestForm onAdd={addRequest} />
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading requests…</span>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState title="No requests yet" hint="Submit a maintenance issue or ask for something." />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{r.title}</p>
                  {r.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    from {nameFor(r.created_by)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-3 flex gap-2">
                {statusOrder.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(r.id, s)}
                    disabled={r.status === s}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      r.status === s
                        ? 'cursor-default bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    Mark {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
