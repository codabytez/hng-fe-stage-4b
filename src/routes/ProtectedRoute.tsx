import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useCryptoStore } from '@/store/crypto.store'

export function ProtectedRoute() {
  const { isAuthenticated, hasKeys } = useAuthStore()
  const { isReady } = useCryptoStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Keys exist on server/IndexedDB but aren't loaded into memory yet (e.g. page refresh)
  if (!hasKeys || !isReady) {
    return <Navigate to="/key-setup" replace />
  }

  return <Outlet />
}

export function AuthRoute() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
