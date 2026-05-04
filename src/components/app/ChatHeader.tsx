import { Lock1 } from 'iconsax-reactjs'
import { Avatar } from './Avatar'
import type { User } from '@/types/models'

interface ChatHeaderProps {
  user: User
  online?: boolean
}

export function ChatHeader({ user, online }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
      <Avatar name={user.display_name} userId={user.id} size="md" online={online} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-primary">{user.display_name}</span>
          <span className="text-xs text-text-muted">@{user.username}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-teal-muted bg-teal-subtle text-teal text-xs font-medium">
            <Lock1 size={10} color="currentColor" variant="Bold" />
            End-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  )
}
