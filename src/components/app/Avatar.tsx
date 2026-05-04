import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/format'

const HUES = [210, 270, 30, 150, 180, 330, 0, 60]

function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = HUES[Math.abs(hash) % HUES.length]
  return `hsl(${hue}, 55%, 30%)`
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

const dotSizes = {
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-[1.5px]',
  lg: 'w-3 h-3 border-2',
}

interface AvatarProps {
  name: string
  userId: string
  size?: keyof typeof sizes
  online?: boolean
  className?: string
}

export function Avatar({ name, userId, size = 'md', online, className }: AvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white select-none',
          sizes[size]
        )}
        style={{ backgroundColor: avatarColor(userId) }}
      >
        {getInitials(name)}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-bg',
            dotSizes[size],
            online ? 'bg-success' : 'bg-text-muted'
          )}
        />
      )}
    </div>
  )
}
