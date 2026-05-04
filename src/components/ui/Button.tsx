import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            primary:
              'bg-teal text-bg hover:bg-teal-dim focus-visible:ring-teal',
            secondary:
              'bg-surface-2 text-text-primary border border-border hover:bg-border focus-visible:ring-border',
            ghost:
              'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-2 focus-visible:ring-border',
            danger:
              'bg-error text-white hover:opacity-90 focus-visible:ring-error',
          }[variant],
          {
            sm: 'h-8 px-3 text-xs gap-1.5',
            md: 'h-10 px-4 text-sm gap-2',
            lg: 'h-11 px-5 text-sm gap-2',
          }[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
