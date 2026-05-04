import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock1, Eye, EyeSlash } from 'iconsax-reactjs'
import { Logo } from '@/components/shared/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { loadKeyMaterial } from '@/crypto/storage'
import { unwrapPrivateKey } from '@/crypto/pbkdf2'
import { importPublicKeyFromJwk } from '@/crypto/keys'
import { useCryptoStore } from '@/store/crypto.store'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

export function KeySetup() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setKeyPair } = useCryptoStore()
  const { setHasKeys, logout } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ password }: FormValues) {
    setError(null)

    const material = await loadKeyMaterial()

    if (!material) {
      // IndexedDB was cleared — keys are unrecoverable
      setHasKeys(false)
      navigate('/key-lost', { replace: true })
      return
    }

    try {
      const privateKey = await unwrapPrivateKey(
        material.wrappedPrivateKey,
        material.pbkdf2Salt,
        password
      )
      const publicKey = await importPublicKeyFromJwk(material.publicKeyJwk)
      setKeyPair(privateKey, publicKey)
      navigate('/key-ready', { replace: true })
    } catch {
      setError('Wrong password. Please try again.')
    }
  }

  function handleSignOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mt-2">
            <Lock1 size={26} color="var(--color-teal)" variant="Bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Unlock your keys</h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Enter your password to decrypt your private key and continue.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            autoFocus
            error={errors.password?.message ?? error ?? undefined}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlash size={18} color="currentColor" /> : <Eye size={18} color="currentColor" />}
              </button>
            }
            {...register('password')}
          />

          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Unlocking…' : 'Unlock'}
          </Button>
        </form>

        <p className="text-xs text-center text-text-muted">
          Not you?{' '}
          <button
            onClick={handleSignOut}
            className="text-text-secondary underline underline-offset-2 hover:text-text-primary transition-colors"
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  )
}
