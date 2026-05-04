import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { useCryptoStore } from '@/store/crypto.store'
import { unwrapPrivateKey } from '@/crypto/pbkdf2'
import { importPublicKeyFromSpki } from '@/crypto/keys'
import { storeKeyMaterial, loadKeyMaterial } from '@/crypto/storage'
import { getApiError } from '@/utils/apiError'

interface LoginInput {
  username: string
  password: string
}

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth, setHasKeys } = useAuthStore()
  const { setKeyPair } = useCryptoStore()

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: async (data, variables) => {
      setAuth(
        {
          id: data.user.id,
          username: data.user.username,
          display_name: data.user.display_name,
          public_key: data.user.public_key,
          created_at: data.user.created_at,
        },
        data.access_token,
        data.refresh_token
      )

      const privateKey = await unwrapPrivateKey(
        data.user.wrapped_private_key,
        data.user.pbkdf2_salt,
        variables.password
      )
      const publicKey = await importPublicKeyFromSpki(data.user.public_key)
      setKeyPair(privateKey, publicKey)

      await storeKeyMaterial({
        wrappedPrivateKey: data.user.wrapped_private_key,
        pbkdf2Salt: data.user.pbkdf2_salt,
        publicKeyJwk: await crypto.subtle.exportKey('jwk', publicKey),
      })

      const stored = await loadKeyMaterial()
      setHasKeys(stored !== null)

      toast.success('Welcome back!')
      navigate('/')
    },
    onError: (error) => {
      toast.error(getApiError(error) ?? 'Something went wrong. Please try again.')
    },
  })
}
