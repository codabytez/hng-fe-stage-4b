import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { formatConversationTime, truncate } from '@/utils/format'
import { Avatar } from './Avatar'
import type { Conversation } from '@/types/models'

interface ConversationItemProps {
  conversation: Conversation
  active?: boolean
  online?: boolean
}

function previewText(convo: Conversation): string {
  const msg = convo.last_message
  if (!msg) return 'No messages yet'
  if (msg.decryption_failed) return '[Encrypted message]'
  if (msg.decrypted_content) return truncate(msg.decrypted_content, 40)
  return '…'
}

export function ConversationItem({ conversation, active, online }: ConversationItemProps) {
  const { user, last_message, unread_count } = conversation

  return (
    <Link
      to={`/chat/${user.id}`}
      className={cn(
        'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer',
        active ? 'bg-surface-2' : 'hover:bg-surface'
      )}
    >
      <Avatar name={user.display_name} userId={user.id} size="md" online={online} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text-primary truncate">{user.display_name}</span>
          {last_message && (
            <span className="text-xs text-text-muted flex-shrink-0">
              {formatConversationTime(last_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-text-secondary truncate">{previewText(conversation)}</span>
          {unread_count > 0 && (
            <span className="flex-shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-teal text-bg text-xs font-semibold flex items-center justify-center">
              {unread_count > 99 ? '99+' : unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
