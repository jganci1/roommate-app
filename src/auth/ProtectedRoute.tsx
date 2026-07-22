import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Spinner } from '../components/ui/Spinner'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
