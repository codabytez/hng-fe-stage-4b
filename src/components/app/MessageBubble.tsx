import { TickCircle } from 'iconsax-reactjs'
import { cn } from '@/utils/cn'
import { formatMessageTime } from '@/utils/format'
import { Avatar } from './Avatar'
import type { Message } from '@/types/models'

interface MessageBubbleProps {
  message: Message
  isSender: boolean
  senderName: string
  senderId: string
  showAvatar?: boolean
}

export function MessageBubble({
  message,
  isSender,
  senderName,
  senderId,
  showAvatar = true,
}: MessageBubbleProps) {
  const content = message.decrypted_content
  const failed = message.decryption_failed

  return (
    <div className={cn('flex items-end gap-2 group', isSender ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar placeholder to keep alignment consistent */}
      <div className="w-8 flex-shrink-0">
        {!isSender && showAvatar && (
          <Avatar name={senderName} userId={senderId} size="sm" />
        )}
      </div>

      <div className={cn('flex flex-col gap-1 max-w-[65%]', isSender ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isSender
              ? 'bg-teal text-bg rounded-br-sm'
              : 'bg-surface-2 text-text-primary rounded-bl-sm',
            failed && 'opacity-60 italic'
          )}
        >
          {failed
            ? '[encrypted message — unable to decrypt]'
            : (content ?? '…')}
        </div>

        <div className={cn('flex items-center gap-1', isSender ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs text-text-muted">
            {formatMessageTime(message.created_at)}
          </span>
          {isSender && (
            <TickCircle size={12} color="var(--color-text-muted)" variant="Bold" />
          )}
        </div>
      </div>
    </div>
  )
}
