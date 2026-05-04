import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 gap-8 text-center">
      <Logo />
      <div className="flex flex-col items-center gap-3">
        <span className="text-7xl font-bold text-surface-2 select-none">404</span>
        <h1 className="text-xl font-semibold text-text-primary">Page not found</h1>
        <p className="text-sm text-text-secondary max-w-xs">
          This page doesn't exist or you don't have access to it.
        </p>
      </div>
      <Button variant="secondary" onClick={() => navigate('/', { replace: true })}>
        Back to conversations
      </Button>
    </div>
  )
}
