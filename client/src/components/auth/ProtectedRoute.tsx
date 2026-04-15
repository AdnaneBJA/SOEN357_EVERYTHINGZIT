import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'var(--font-sans)',
        color: 'var(--color-text-muted)', fontSize: '0.9375rem',
      }}>
        Loading...
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
