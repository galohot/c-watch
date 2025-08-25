'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export const TerminalButton = forwardRef<HTMLButtonElement, TerminalButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = 'terminal-button inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      default: 'bg-orange-400/10 border-orange-400/30 text-orange-400 hover:bg-orange-400/20 hover:border-orange-400/50',
      primary: 'bg-orange-400 border-orange-400 text-black hover:bg-orange-500 hover:border-orange-500',
      secondary: 'bg-gray-600/20 border-gray-600/30 text-gray-300 hover:bg-gray-600/30 hover:border-gray-600/50',
      danger: 'bg-red-400/10 border-red-400/30 text-red-400 hover:bg-red-400/20 hover:border-red-400/50',
      ghost: 'border-transparent text-orange-400/70 hover:text-orange-400 hover:bg-orange-400/10',
      outline: 'bg-transparent border-orange-400/50 text-orange-400 hover:bg-orange-400/10'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className={cn('flex-shrink-0', children && 'mr-2')}>
                {icon}
              </span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className={cn('flex-shrink-0', children && 'ml-2')}>
                {icon}
              </span>
            )}
          </>
        )}
      </button>
    )
  }
)

TerminalButton.displayName = 'TerminalButton'

// Predefined button components
export function RefreshButton({ 
  onClick, 
  loading, 
  className 
}: { 
  onClick?: () => void
  loading?: boolean
  className?: string 
}) {
  return (
    <TerminalButton
      variant="ghost"
      size="sm"
      onClick={onClick}
      loading={loading}
      className={className}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      }
    >
      Refresh
    </TerminalButton>
  )
}

export function FilterButton({ 
  active, 
  onClick, 
  className 
}: { 
  active?: boolean
  onClick?: () => void
  className?: string 
}) {
  return (
    <TerminalButton
      variant={active ? "primary" : "outline"}
      size="sm"
      onClick={onClick}
      className={className}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
      }
    >
      Filter
    </TerminalButton>
  )
}

export function ExportButton({ 
  onClick, 
  loading, 
  className 
}: { 
  onClick?: () => void
  loading?: boolean
  className?: string 
}) {
  return (
    <TerminalButton
      variant="secondary"
      size="sm"
      onClick={onClick}
      loading={loading}
      className={className}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
    >
      Export
    </TerminalButton>
  )
}