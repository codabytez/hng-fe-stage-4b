import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { useCryptoStore } from '@/store/crypto.store'
import { usePresenceStore } from '@/store/presence.store'
import { useSocketStore } from '@/store/socket.store'
import { decryptMessage } from '@/crypto/decrypt'
import { isReplay } from '@/utils/replay'
import type { Message } from '@/types/models'
import type { MessagesPage } from './useMessages'

const WS_BASE = import.meta.env.VITE_WS_URL as string
const MAX_BACKOFF = 30_000

type WsEvent =
  | ({ event: 'message.receive' } & Message)
  | { event: 'user.online'; user_id: string }
  | { event: 'user.offline'; user_id: string }
  | { event: 'error'; message: string }

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const qc = useQueryClient()
  const { accessToken, user, isAuthenticated } = useAuthStore()
  const { privateKey } = useCryptoStore()
  const { setOnline, setOffline } = usePresenceStore()
  const { setWs } = useSocketStore()

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !privateKey || !user) return

    const currentUser = user
    const currentKey = privateKey
    let destroyed = false
    let retryDelay = 1_000
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    function connect() {
      if (destroyed) return

      const ws = new WebSocket(`${WS_BASE}?token=${accessToken}`)
      wsRef.current = ws

      ws.onmessage = async (event: MessageEvent<string>) => {
        let parsed: WsEvent
        try {
          parsed = JSON.parse(event.data) as WsEvent
        } catch {
          return
        }

        if (parsed.event === 'message.receive') {
          const msg = parsed as unknown as Message
          if (isReplay(msg.id, msg.created_at)) {
            return
          }
          const isSender = msg.from_user_id === currentUser.id
          let decrypted: Message

          try {
            const text = await decryptMessage(
              {
                ciphertext: msg.payload.ciphertext,
                iv: msg.payload.iv,
                encryptedKey: msg.payload.encryptedKey,
                encryptedKeyForSelf: msg.payload.encryptedKeyForSelf,
              },
              currentKey,
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

        if (parsed.event === 'user.online') setOnline(parsed.user_id)
        if (parsed.event === 'user.offline') setOffline(parsed.user_id)
      }

      ws.onopen = () => {
        retryDelay = 1_000
        setWs(ws)
      }

      ws.onerror = () => {}

      ws.onclose = (e) => {
        wsRef.current = null
        setWs(null)
        if (destroyed) return

        if (e.code === 4001) {
          // Token rejected — refresh it and let the effect re-run with the new token
          const { refreshToken, setAccessToken, logout } = useAuthStore.getState()
          if (refreshToken) {
            authService.refresh(refreshToken)
              .then(({ access_token }) => setAccessToken(access_token))
              .catch(() => logout())
          }
          return
        }

        retryTimer = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, MAX_BACKOFF)
          connect()
        }, retryDelay)
      }
    }

    connect()

    return () => {
      destroyed = true
      if (retryTimer) clearTimeout(retryTimer)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [isAuthenticated, accessToken, privateKey, user, qc, setOnline, setOffline, setWs])

  return wsRef
}
