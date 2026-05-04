import { Lock1 } from 'iconsax-reactjs'
import { AppShell } from '@/components/app/AppShell'

export function Conversations() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 bg-bg">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
          <Lock1 size={28} color="var(--color-teal)" variant="Bold" />
        </div>
        <div className="flex flex-col gap-2 max-w-xs">
          <h2 className="text-lg font-semibold text-text-primary">Select a conversation</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Choose a conversation from the sidebar, or start a new one. All messages are end-to-end encrypted.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
