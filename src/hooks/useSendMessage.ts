import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { encryptMessage } from '@/crypto/encrypt'
import { importPublicKeyFromSpki } from '@/crypto/keys'
import { usersService } from '@/services/users.service'
import { messagesService } from '@/services/messages.service'
import { useAuthStore } from '@/store/auth.store'
import { useCryptoStore } from '@/store/crypto.store'
import { useSocketStore } from '@/store/socket.store' // getState() used inside mutationFn
import { getApiError } from '@/utils/apiError'
import type { Message } from '@/types/models'
import type { MessagesPage } from './useMessages'

interface SendInput {
  recipientId: string
  plaintext: string
}

interface MutationContext {
  tempId: string
  sentViaWs: boolean
}

export function useSendMessage() {
  const { user } = useAuthStore()
  const { privateKey, publicKey } = useCryptoStore()
  const qc = useQueryClient()

  return useMutation<Message, Error, SendInput, MutationContext>({
    onMutate: async ({ recipientId, plaintext }) => {
      await qc.cancelQueries({ queryKey: ['messages', recipientId] })

      const tempId = `temp-${Date.now()}`
      const tempMsg: Message = {
        id: tempId,
        from_user_id: user?.id ?? '',
        to_user_id: recipientId,
        payload: { ciphertext: '', iv: '', encryptedKey: '', encryptedKeyForSelf: '' },
        delivered: false,
        created_at: new Date().toISOString(),
        decrypted_content: plaintext,
      }

      qc.setQueryData<InfiniteData<MessagesPage>>(
        ['messages', recipientId],
        (old) => {
          const emptyPage: MessagesPage = { messages: [], next_cursor: undefined }
          const base = old ?? { pages: [emptyPage], pageParams: [undefined] }
          const pages = base.pages.map((page, i) =>
            i === 0 ? { ...page, messages: [tempMsg, ...page.messages] } : page
          )
          return { ...base, pages }
        }
      )

      const { ws: currentWs } = useSocketStore.getState()
      const sentViaWs = !!(currentWs && currentWs.readyState === WebSocket.OPEN)
      return { tempId, sentViaWs }
    },

    mutationFn: async ({ recipientId, plaintext }: SendInput) => {
      if (!user || !privateKey || !publicKey) throw new Error('Keys not ready')

      const { public_key: recipientSpki } = await usersService.getPublicKey(recipientId)
      const recipientPublicKey = await importPublicKeyFromSpki(recipientSpki)

      const encrypted = await encryptMessage(plaintext, recipientPublicKey, publicKey)

      const payload = {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        encryptedKey: encrypted.encryptedKey,
        encryptedKeyForSelf: encrypted.encryptedKeyForSelf,
      }

      const ws = useSocketStore.getState().ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: 'message.send', to: recipientId, payload }))
        return { id: `ws-${Date.now()}`, from_user_id: user.id, to_user_id: recipientId, payload, delivered: false, created_at: new Date().toISOString() } satisfies Message
      }

      return messagesService.sendMessage({ to: recipientId, payload })
    },

    onSuccess: (sentMsg, { recipientId, plaintext }, context) => {
      if (context?.sentViaWs) {
        // temp stays visible; invalidate so the next fetch brings in the real message
        qc.invalidateQueries({ queryKey: ['messages', recipientId] })
      } else {
        const decryptedMsg: Message = { ...sentMsg, decrypted_content: plaintext }
        qc.setQueryData<InfiniteData<MessagesPage>>(
          ['messages', recipientId],
          (old) => {
            if (!old) return old
            const pages = old.pages.map((page, i) => {
              if (i !== 0) return page
              const filtered = page.messages.filter(
                (m) => m.id !== context?.tempId && m.id !== decryptedMsg.id
              )
              return { ...page, messages: [decryptedMsg, ...filtered] }
            })
            return { ...old, pages }
          }
        )
      }

      qc.invalidateQueries({ queryKey: ['conversations'] })
    },

    onError: (error, { recipientId }, context) => {
      qc.setQueryData<InfiniteData<MessagesPage>>(
        ['messages', recipientId],
        (old) => {
          if (!old) return old
          const pages = old.pages.map((page, i) => {
            if (i !== 0) return page
            return { ...page, messages: page.messages.filter((m) => m.id !== context?.tempId) }
          })
          return { ...old, pages }
        }
      )
      toast.error(getApiError(error) ?? 'Failed to send message')
    },
  })
}
