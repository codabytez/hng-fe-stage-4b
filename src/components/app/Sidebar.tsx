import { useState } from 'react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageAdd1, SearchNormal1, LogoutCurve } from 'iconsax-reactjs'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/Logo'
import { Avatar } from './Avatar'
import { ConversationItem } from './ConversationItem'
import { useConversations } from '@/hooks/useConversations'
import { useAuthStore } from '@/store/auth.store'
import { usePresenceStore } from '@/store/presence.store'
import { useCryptoStore } from '@/store/crypto.store'
import { authService } from '@/services/auth.service'

export function Sidebar() {
  const [search, setSearch] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { userId: activeUserId } = useParams<{ userId: string }>()

  const { user, refreshToken, logout } = useAuthStore()
  const { clearKeys } = useCryptoStore()
  const { onlineUserIds } = usePresenceStore()
  const { data: conversations = [], isLoading } = useConversations()

  async function handleLogout() {
    setLoggingOut(true)
    try {
      if (refreshToken) await authService.logout(refreshToken)
    } catch {
      // best-effort
    } finally {
      clearKeys()
      logout()
      navigate('/login')
      toast.success('Signed out.')
    }
  }

  const filtered = conversations.filter((c) => {
    if (!c.user) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.user.display_name.toLowerCase().includes(q) || c.user.username.toLowerCase().includes(q)
    )
  })

  return (
    <aside className="flex flex-col w-full md:w-72 border-r border-border bg-surface h-full shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <Logo iconSize={16} />
        <button
          onClick={() => navigate('/new')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="New conversation"
        >
          <MessageAdd1 size={18} color="currentColor" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <SearchNormal1
            size={14}
            color="var(--color-text-muted)"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-lg text-sm bg-surface-2 border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 px-1 py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="w-10 h-10 rounded-full bg-surface-2 animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-32 rounded bg-surface-2 animate-pulse" />
                  <div className="h-2.5 w-44 rounded bg-surface-2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-text-muted">
              {search ? 'No conversations match.' : 'No conversations yet.'}
            </p>
          </div>
        ) : (
          filtered.map((convo) => (
            <ConversationItem
              key={convo.user.id}
              conversation={convo}
              active={convo.user.id === activeUserId}
              online={onlineUserIds.has(convo.user.id)}
            />
          ))
        )}
      </div>

      {/* User footer */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
          <Avatar name={user.display_name} userId={user.id} size="sm" online />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{user.display_name}</p>
            <p className="text-xs text-text-muted truncate">@{user.username}</p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
            aria-label="Sign out"
          >
            <LogoutCurve size={16} color="currentColor" />
          </button>
        </div>
      )}

      <ConfirmModal
        open={showLogoutModal}
        title="Sign out?"
        description="You'll need your password to decrypt your messages when you sign back in."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        destructive
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </aside>
  )
}
