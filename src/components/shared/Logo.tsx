import { cn } from '@/utils/cn'
import { ShieldIcon } from './ShieldIcon'

interface LogoProps {
  className?: string
  iconSize?: number
}

export function Logo({ className, iconSize = 18 }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ShieldIcon size={iconSize} />
      <span className="text-lg font-semibold text-text-primary tracking-tight">WhisperBox</span>
    </div>
  )
}
