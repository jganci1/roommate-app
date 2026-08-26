import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../auth/useAuth'

type Mode = 'choose' | 'create' | 'join'

export function OnboardingPage() {
  const { profile, refreshProfile } = useAuth()
  const [mode, setMode] = useState<Mode>('choose')
  const [householdName, setHouseholdName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (profile?.household_id) return <Navigate to="/" replace />

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await supabase.rpc('create_household', { household_name: householdName })
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    await refreshProfile()
  }

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await supabase.rpc('join_household', { code: joinCode })
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    await refreshProfile()
  }

  return (
    <div className="beach-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        {mode === 'choose' && (
          <>
            <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Welcome!
            </h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Create a new household or join one with an invite code.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setMode('create')} className="w-full">
                Create a household
              </Button>
              <Button variant="secondary" onClick={() => setMode('join')} className="w-full">
                Join with a code
              </Button>
            </div>
          </>
        )}

        {mode === 'create' && (
          <>
            <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Create a household
            </h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Give it a name — you'll get a code to invite roommates after.
            </p>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="e.g. 12 Maple Street"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button type="submit" disabled={submitting || !householdName.trim()}>
                {submitting ? 'Creating…' : 'Create household'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode('choose')
                  setError(null)
                }}
              >
                Back
              </Button>
            </form>
          </>
        )}

        {mode === 'join' && (
          <>
            <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Join a household
            </h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Enter the invite code a roommate shared with you.
            </p>
            <form onSubmit={handleJoin} className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="e.g. AB3XQ9"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm uppercase tracking-widest dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button type="submit" disabled={submitting || !joinCode.trim()}>
                {submitting ? 'Joining…' : 'Join household'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode('choose')
                  setError(null)
                }}
              >
                Back
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
