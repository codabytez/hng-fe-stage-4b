import type { ReactNode } from 'react'
import { Lock } from 'iconsax-reactjs'
import { Logo } from '@/components/shared/Logo'

interface AuthSplitLayoutProps {
  children: ReactNode
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="relative flex flex-col w-full lg:w-1/2 bg-bg px-8 py-8 md:px-14">
        <Logo />
        <div className="flex-1 flex flex-col justify-center max-w-sm mt-24 pb-8">
          {children}
        </div>
      </div>

      {/* Right panel — branding */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-surface border-l border-border relative px-12">
        <div className="flex flex-col items-center gap-6 text-center max-w-xs">
          <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <Lock size={36} color="var(--color-teal)" variant="Bold" />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Private by design.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Only you and the person you're writing to can read what's sent. Not us. Not anyone
              else.
            </p>
          </div>
        </div>

        {/* E2EE badge — pinned bottom */}
        <div className="absolute bottom-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-teal text-text-primary">
            <span className="w-2 h-2 rounded-full bg-teal" />
            <span className="text-xs font-medium tracking-widest uppercase">
              End-to-End Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
