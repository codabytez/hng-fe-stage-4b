import { useParams, Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/app/AppShell'
import { ChatPanel } from '@/components/app/ChatPanel'
import { messagesService } from '@/services/messages.service'
import type { User } from '@/types/models'

function useChatRecipient(userId: string, stateUser?: User) {
  return useQuery({
    queryKey: ['recipient', userId],
    queryFn: async (): Promise<User | null> => {
      const convos = await messagesService.getConversations()
      return convos.find((c) => c.user.id === userId)?.user ?? null
    },
    // If the user was passed via navigation state, use it immediately
    initialData: stateUser,
    staleTime: 60_000,
  })
}

export function Chat() {
  const { userId } = useParams<{ userId: string }>()

  if (!userId) return <Navigate to="/" replace />

  return <ChatInner userId={userId} />
}

function ChatInner({ userId }: { userId: string }) {
  const location = useLocation()
  const stateUser = (location.state as { user?: User } | null)?.user

  const { data: recipient, isLoading } = useChatRecipient(userId, stateUser)

  if (isLoading && !stateUser) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (!recipient) {
    return <Navigate to="/" replace />
  }

  return (
    <AppShell>
      <ChatPanel recipient={recipient} />
    </AppShell>
  )
}
