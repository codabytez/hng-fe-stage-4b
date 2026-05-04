import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeSlash } from 'iconsax-reactjs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

interface LoginFormProps {
  onSubmit: (values: FormValues) => Promise<unknown>
  isLoading?: boolean
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Welcome back</h1>
        <p className="text-sm text-text-secondary">Sign in to continue.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Username"
          placeholder="your_username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlash size={18} color="currentColor" />
              ) : (
                <Eye size={18} color="currentColor" />
              )}
            </button>
          }
          {...register('password')}
        />

        <Button type="submit" size="lg" loading={isLoading} className="w-full mt-1">
          Sign in
        </Button>
      </form>

      <p className="text-sm text-center text-text-secondary">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-teal underline underline-offset-2 hover:text-teal-dim transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
