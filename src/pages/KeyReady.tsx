import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TickCircle } from 'iconsax-reactjs'
import { Logo } from '@/components/shared/Logo'

export function KeyReady() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/', { replace: true }), 1500)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-5">
      <Logo />
      <div className="flex flex-col items-center gap-3 text-center">
        <TickCircle size={48} color="var(--color-teal)" variant="Bold" />
        <p className="text-base font-semibold text-text-primary">Keys unlocked</p>
        <p className="text-sm text-text-secondary">Taking you back…</p>
      </div>
    </div>
  )
}
