import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeSlash } from 'iconsax-reactjs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z
  .object({
    display_name: z.string().min(2, 'Display name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

interface RegisterFormProps {
  onSubmit: (values: FormValues) => Promise<unknown>
  isLoading?: boolean
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Create account</h1>
        <p className="text-sm text-text-secondary">Start messaging privately.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Display name"
          placeholder="John Doe"
          autoComplete="name"
          error={errors.display_name?.message}
          {...register('display_name')}
        />

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
          autoComplete="new-password"
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

        <Input
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
                <EyeSlash size={18} color="currentColor" />
              ) : (
                <Eye size={18} color="currentColor" />
              )}
            </button>
          }
          {...register('confirm_password')}
        />

        <Button type="submit" size="lg" loading={isLoading} className="w-full mt-1">
          {isLoading ? 'Generating keys…' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-center text-text-secondary">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-teal underline underline-offset-2 hover:text-teal-dim transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
