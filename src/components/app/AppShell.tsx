import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useWebSocket } from '@/hooks/useWebSocket'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useWebSocket()
  const { userId } = useParams<{ userId?: string }>()
  const isChatOpen = Boolean(userId)

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* On mobile: sidebar fills screen when no chat open, hidden when chat is open */}
      <div className={`${isChatOpen ? 'hidden md:flex' : 'flex w-full md:w-auto'} shrink-0`}>
        <Sidebar />
      </div>
      {/* On mobile: main fills screen only when a chat is open */}
      <main className={`${isChatOpen ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 overflow-hidden`}>
        {children}
      </main>
    </div>
  )
}
