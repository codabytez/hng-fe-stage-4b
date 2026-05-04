import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { useCryptoStore } from '@/store/crypto.store'
import { generateKeyPair, exportPublicKeyAsSpki, importPublicKeyFromSpki } from '@/crypto/keys'
import { wrapPrivateKey } from '@/crypto/pbkdf2'
import { storeKeyMaterial, loadKeyMaterial } from '@/crypto/storage'
import { getApiError } from '@/utils/apiError'

interface RegisterInput {
  display_name: string
  username: string
  password: string
}

export function useRegister() {
  const navigate = useNavigate()
  const { setAuth, setHasKeys } = useAuthStore()
  const { setKeyPair } = useCryptoStore()

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const keyPair = await generateKeyPair()
      const publicKeySpki = await exportPublicKeyAsSpki(keyPair.publicKey)
      const { wrappedPrivateKey, pbkdf2Salt } = await wrapPrivateKey(
        keyPair.privateKey,
        input.password
      )

      const data = await authService.register({
        username: input.username,
        display_name: input.display_name,
        password: input.password,
        public_key: publicKeySpki,
        wrapped_private_key: wrappedPrivateKey,
        pbkdf2_salt: pbkdf2Salt,
      })

      return { data, keyPair, wrappedPrivateKey, pbkdf2Salt }
    },
    onSuccess: async ({ data, keyPair, wrappedPrivateKey, pbkdf2Salt }) => {
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

      setKeyPair(keyPair.privateKey, keyPair.publicKey)

      const publicKey = await importPublicKeyFromSpki(data.user.public_key)
      await storeKeyMaterial({
        wrappedPrivateKey,
        pbkdf2Salt,
        publicKeyJwk: await crypto.subtle.exportKey('jwk', publicKey),
      })

      const stored = await loadKeyMaterial()
      setHasKeys(stored !== null)

      toast.success('Account created! Welcome to WhisperBox.')
      navigate('/')
    },
    onError: (error) => {
      toast.error(getApiError(error) ?? 'Something went wrong. Please try again.')
    },
  })
}
