import { useNavigate } from 'react-router-dom'
import { Lock1 } from 'iconsax-reactjs'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'

export function KeyLost() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  function handleSignOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">
        <Logo />

        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-error-subtle border border-error/20 flex items-center justify-center">
            <Lock1 size={26} color="var(--color-error)" variant="Bold" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Keys not found</h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your private key was stored in this browser's local storage, which has been cleared.
              Previous messages are permanently unreadable.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Sign out and register a new account, or sign in again from a device that still has your keys.
            </p>
          </div>
        </div>

        <Button variant="danger" size="lg" className="w-full" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
