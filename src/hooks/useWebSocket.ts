import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { useCryptoStore } from '@/store/crypto.store'
import { usePresenceStore } from '@/store/presence.store'
import { decryptMessage } from '@/crypto/decrypt'
import { isReplay } from '@/utils/replay'
import type { Message } from '@/types/models'
import type { MessagesPage } from './useMessages'

const WS_BASE = import.meta.env.VITE_WS_URL as string

type WsEvent =
  | { type: 'message.receive'; data: Message }
  | { type: 'user.online'; data: { user_id: string } }
  | { type: 'user.offline'; data: { user_id: string } }
  | { type: 'error'; data: { message: string } }

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const qc = useQueryClient()
  const { accessToken, user, isAuthenticated } = useAuthStore()
  const { privateKey } = useCryptoStore()
  const { setOnline, setOffline } = usePresenceStore()

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !privateKey || !user) return

    const ws = new WebSocket(`${WS_BASE}?token=${accessToken}`)
    wsRef.current = ws

    ws.onmessage = async (event: MessageEvent<string>) => {
      let parsed: WsEvent
      try {
        parsed = JSON.parse(event.data) as WsEvent
      } catch {
        return
      }

      if (parsed.type === 'message.receive') {
        const msg = parsed.data
        if (isReplay(msg.id, msg.created_at)) return
        const isSender = msg.from_user_id === user.id
        let decrypted: Message

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
          decrypted = { ...msg, decrypted_content: text }
        } catch {
          decrypted = { ...msg, decryption_failed: true }
        }

        const otherUserId = isSender ? msg.to_user_id : msg.from_user_id

        qc.setQueryData<InfiniteData<MessagesPage>>(
          ['messages', otherUserId],
          (old) => {
            if (!old) return old
            const pages = old.pages.map((page, i) => {
              if (i !== 0) return page
              if (page.messages.some((m) => m.id === decrypted.id)) return page
              return { ...page, messages: [decrypted, ...page.messages] }
            })
            return { ...old, pages }
          }
        )

        qc.invalidateQueries({ queryKey: ['conversations'] })
      }

      if (parsed.type === 'user.online') {
        setOnline(parsed.data.user_id)
      }

      if (parsed.type === 'user.offline') {
        setOffline(parsed.data.user_id)
      }
    }

    ws.onerror = () => {}
    ws.onclose = () => { wsRef.current = null }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [isAuthenticated, accessToken, privateKey, user, qc, setOnline, setOffline])

  return wsRef
}
