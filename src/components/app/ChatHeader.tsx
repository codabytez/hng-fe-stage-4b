import { Lock1, ArrowLeft } from 'iconsax-reactjs'
import { useNavigate } from 'react-router-dom'
import { Avatar } from './Avatar'
import type { User } from '@/types/models'

interface ChatHeaderProps {
  user: User
  online?: boolean
}

export function ChatHeader({ user, online }: ChatHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface shrink-0">
      <button
        onClick={() => navigate('/')}
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors -ml-1 shrink-0"
        aria-label="Back to conversations"
      >
        <ArrowLeft size={20} color="currentColor" />
      </button>
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
