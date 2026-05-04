import { useQuery } from '@tanstack/react-query'
import { messagesService } from '@/services/messages.service'
import { useCryptoStore } from '@/store/crypto.store'
import { useAuthStore } from '@/store/auth.store'
import { decryptMessage } from '@/crypto/decrypt'
import type { Conversation } from '@/types/models'

export function useConversations() {
  const { privateKey } = useCryptoStore()
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<Conversation[]> => {
      const convos = await messagesService.getConversations()
      if (!privateKey || !user) return convos

      return Promise.all(
        convos.map(async (convo) => {
          if (!convo.last_message) return convo
          const msg = convo.last_message
          const isSender = msg.from_user_id === user.id
          try {
            const text = await decryptMessage(
              {
                ciphertext: msg.payload.ciphertext,
                iv: msg.payload.iv,
                encryptedKey: msg.payload.encryptedKey,
                encryptedKeyForSelf: msg.payload.encryptedKeyForSelf,
              },
              privateKey,
              isSender
            )
            return { ...convo, last_message: { ...msg, decrypted_content: text } }
          } catch {
            return { ...convo, last_message: { ...msg, decryption_failed: true } }
          }
        })
      )
    },
    enabled: !!privateKey && !!user,
    staleTime: 30_000,
  })
}
