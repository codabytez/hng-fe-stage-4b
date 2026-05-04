import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useRegister } from '@/hooks/useRegister'

export function Register() {
  const { mutateAsync, isPending } = useRegister()

  return (
    <AuthSplitLayout>
      <RegisterForm onSubmit={mutateAsync} isLoading={isPending} />
    </AuthSplitLayout>
  )
}
