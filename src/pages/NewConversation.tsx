import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SearchNormal1, MessageAdd1 } from 'iconsax-reactjs'
import { AppShell } from '@/components/app/AppShell'
import { Avatar } from '@/components/app/Avatar'
import { usersService } from '@/services/users.service'
import { useDebounce } from '@/hooks/useDebounce'
import type { User } from '@/types/models'

export function NewConversation() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const debouncedQuery = useDebounce(query, 300)

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['user-search', debouncedQuery],
    queryFn: () => usersService.search(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 1,
    staleTime: 30_000,
  })

  function openChat(user: User) {
    navigate(`/chat/${user.id}`, { state: { user } })
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-bg">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <MessageAdd1 size={20} color="var(--color-teal)" />
          <h1 className="text-base font-semibold text-text-primary">New conversation</h1>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-border">
          <div className="relative">
            <SearchNormal1
              size={15}
              color="var(--color-text-muted)"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              autoFocus
              placeholder="Search by name or username…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!debouncedQuery.trim() ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
              <SearchNormal1 size={32} color="var(--color-text-muted)" />
              <p className="text-sm text-text-muted">Type a name or username to find people.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-surface-2 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3 w-28 rounded bg-surface-2 animate-pulse" />
                    <div className="h-2.5 w-20 rounded bg-surface-2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
              <p className="text-sm text-text-muted">No users found for "{debouncedQuery}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => openChat(user)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface transition-colors cursor-pointer text-left w-full"
                >
                  <Avatar name={user.display_name} userId={user.id} size="md" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-text-primary">
                      {user.display_name}
                    </span>
                    <span className="text-xs text-text-muted">@{user.username}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
