import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from './useAuth'

const ROOMMATE_CAP = 10

export function SignupPage() {
  const { session } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const [roommateCount, setRoommateCount] = useState<number | null>(null)

  const checkCapacity = async () => {
    const { data } = await supabase.rpc('profile_count')
    if (typeof data === 'number') setRoommateCount(data)
  }

  useEffect(() => {
    checkCapacity()
  }, [])

  if (session) return <Navigate to="/" replace />

  const isFull = roommateCount !== null && roommateCount >= ROOMMATE_CAP

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    setSubmitting(false)
    if (error) {
      // The DB enforces the real cap; re-check in case this failure was a
      // race with another roommate signing up for the last spot.
      await checkCapacity()
      setError(error.message)
      return
    }
    if (data.session === null) {
      setConfirmSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
          Join the household
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Create your account</p>

        {confirmSent ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Check your email to confirm your account, then come back and sign in.
          </p>
        ) : roommateCount === null ? (
          <div className="flex items-center gap-3 py-2">
            <Spinner />
            <span className="text-sm text-slate-500 dark:text-slate-400">Checking availability…</span>
          </div>
        ) : isFull ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This household already has {ROOMMATE_CAP} roommates, which is the maximum. Ask an
            existing roommate for help if you need access.
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button type="submit" disabled={submitting} className="mt-2 w-full">
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
              {roommateCount} / {ROOMMATE_CAP} roommate spots used
            </p>
          </>
        )}

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-600 dark:text-teal-400">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
