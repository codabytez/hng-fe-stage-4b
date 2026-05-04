import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { useLogin } from '@/hooks/useLogin'

export function Login() {
  const { mutateAsync, isPending } = useLogin()

  return (
    <AuthSplitLayout>
      <LoginForm onSubmit={mutateAsync} isLoading={isPending} />
    </AuthSplitLayout>
  )
}
