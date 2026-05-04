import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useWebSocket } from '@/hooks/useWebSocket'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useWebSocket()

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
