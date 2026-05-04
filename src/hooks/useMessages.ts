import { useInfiniteQuery } from '@tanstack/react-query'
import { messagesService } from '@/services/messages.service'
import { useCryptoStore } from '@/store/crypto.store'
import { useAuthStore } from '@/store/auth.store'
import { decryptMessage } from '@/crypto/decrypt'
import type { Message } from '@/types/models'

async function decryptOne(msg: Message, privateKey: CryptoKey, currentUserId: string): Promise<Message> {
  const isSender = msg.from_user_id === currentUserId
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
    return { ...msg, decrypted_content: text }
  } catch {
    return { ...msg, decryption_failed: true }
  }
}

export type MessagesPage = { messages: Message[]; next_cursor?: string }

export function useMessages(userId: string) {
  const { privateKey } = useCryptoStore()
  const { user } = useAuthStore()

  return useInfiniteQuery({
    queryKey: ['messages', userId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }): Promise<MessagesPage> => {
      const result = await messagesService.getMessages(userId, {
        before: pageParam,
        limit: 50,
      })
      if (!privateKey || !user) return result

      const decrypted = await Promise.all(
        result.messages.map((msg) => decryptOne(msg, privateKey, user.id))
      )
      return { ...result, messages: decrypted }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    enabled: !!userId && !!privateKey && !!user,
    staleTime: 10_000,
  })
}
