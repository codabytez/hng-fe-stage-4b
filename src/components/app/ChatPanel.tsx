import { useEffect, useRef, useCallback } from 'react'
import { ChatHeader } from './ChatHeader'
import { E2EEBanner } from './E2EEBanner'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { useMessages } from '@/hooks/useMessages'
import { useSendMessage } from '@/hooks/useSendMessage'
import { useAuthStore } from '@/store/auth.store'
import { usePresenceStore } from '@/store/presence.store'
import type { User } from '@/types/models'
import type { Message } from '@/types/models'

interface ChatPanelProps {
  recipient: User
}

function isAvatarVisible(messages: Message[], index: number, currentMsg: Message): boolean {
  if (index === messages.length - 1) return true
  const next = messages[index + 1]
  return next.from_user_id !== currentMsg.from_user_id
}

export function ChatPanel({ recipient }: ChatPanelProps) {
  const { user } = useAuthStore()
  const { onlineUserIds } = usePresenceStore()
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useMessages(recipient.id)
  const { mutate: sendMessage, isPending: sending } = useSendMessage()

  const listRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const prevMessageCountRef = useRef(0)

  // Flatten pages newest-first → reverse to chronological order
  const messages = data
    ? [...data.pages].reverse().flatMap((p) => [...p.messages].reverse())
    : []

  function scrollToBottom(smooth = false) {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  }

  function handleScroll() {
    const el = listRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    shouldAutoScrollRef.current = distanceFromBottom < 120
  }

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0 && prevMessageCountRef.current === 0) {
      scrollToBottom()
    }
  }, [isLoading, messages.length])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const prev = prevMessageCountRef.current
    const current = messages.length
    prevMessageCountRef.current = current

    if (current > prev && shouldAutoScrollRef.current) {
      scrollToBottom(true)
    }
  }, [messages.length])

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ recipientId: recipient.id, plaintext: text })
      shouldAutoScrollRef.current = true
    },
    [recipient.id, sendMessage]
  )

  const online = onlineUserIds.has(recipient.id)

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader user={recipient} online={online} />

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-2 flex flex-col"
      >
        <E2EEBanner />

        {/* Load more older messages */}
        {hasNextPage && (
          <div className="flex justify-center pb-4">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex flex-col gap-3 py-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className="h-9 rounded-2xl bg-surface-2 animate-pulse"
                  style={{ width: `${120 + (i * 37) % 140}px` }}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-text-muted">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 pb-2">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSender={msg.from_user_id === user?.id}
                senderName={recipient.display_name}
                senderId={recipient.id}
                showAvatar={isAvatarVisible(messages, i, msg)}
              />
            ))}
          </div>
        )}
      </div>

      <MessageInput
        recipientName={recipient.display_name}
        onSend={handleSend}
        sending={sending}
      />
    </div>
  )
}
