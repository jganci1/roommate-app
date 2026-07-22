import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../auth/useAuth'
import { NavDrawer } from './NavDrawer'
import { Button } from '../ui/Button'

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNavOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M2.5 5h15M2.5 10h15M2.5 15h15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            🏠 The House
          </span>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
              {profile.display_name}
            </span>
          )}
          <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
