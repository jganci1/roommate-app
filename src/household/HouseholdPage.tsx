import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../auth/useAuth'
import { useHouseholdMembers } from './useHouseholdMembers'
import { HouseholdAddressCard } from './HouseholdAddressCard'

export function HouseholdPage() {
  const { household } = useAuth()
  const { members, loading } = useHouseholdMembers()
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (!household) return
    try {
      await navigator.clipboard.writeText(household.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access can fail (permissions, non-secure context); the
      // code is still shown on screen for manual copy either way.
    }
  }

  if (!household) {
    return (
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-slate-500 dark:text-slate-400">Loading household…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{household.name}</h1>

      <HouseholdAddressCard />

      <Card>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Invite roommates</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Share this code — they'll enter it when signing up to join this household.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-center font-mono text-lg tracking-widest text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {household.join_code}
          </span>
          <Button variant="secondary" onClick={copyCode}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">
          Roommates ({members.length} / 10)
        </p>
        {loading ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {members.map((m) => (
              <li key={m.id} className="py-2 text-sm text-slate-700 dark:text-slate-200">
                {m.display_name}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
