import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Spinner } from '../components/ui/Spinner'

export function RequireHousehold() {
  const { profile, loading } = useAuth()

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!profile.household_id) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
