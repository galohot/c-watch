'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  glow?: boolean
  animated?: boolean
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
    glow = false,
    animated = true,
    ...props
  }, ref) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-medium tracking-wide rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
      animated && 'transform hover:scale-105 active:scale-95'
    )
    
    const variants = {
      default: 'bg-slate-800/50 border-slate-600/50 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500/50 focus:ring-slate-400/50',
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500/50 text-white hover:from-blue-500 hover:to-blue-600 hover:border-blue-400/50 focus:ring-blue-400/50 shadow-lg shadow-blue-500/25',
      secondary: 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500/50 text-white hover:from-purple-500 hover:to-purple-600 hover:border-purple-400/50 focus:ring-purple-400/50 shadow-lg shadow-purple-500/25',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 border-red-500/50 text-white hover:from-red-500 hover:to-red-600 hover:border-red-400/50 focus:ring-red-400/50 shadow-lg shadow-red-500/25',
      success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-500/50 text-white hover:from-emerald-500 hover:to-emerald-600 hover:border-emerald-400/50 focus:ring-emerald-400/50 shadow-lg shadow-emerald-500/25',
      warning: 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500/50 text-white hover:from-amber-500 hover:to-amber-600 hover:border-amber-400/50 focus:ring-amber-400/50 shadow-lg shadow-amber-500/25',
      ghost: 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/30 focus:ring-slate-400/50',
      outline: 'bg-transparent border-slate-600/50 text-slate-300 hover:bg-slate-800/30 hover:border-slate-500/50 hover:text-white focus:ring-slate-400/50'
    }
    
    const glowStyles = {
      default: 'shadow-lg shadow-slate-500/20',
      primary: 'shadow-xl shadow-blue-500/40',
      secondary: 'shadow-xl shadow-purple-500/40',
      danger: 'shadow-xl shadow-red-500/40',
      success: 'shadow-xl shadow-emerald-500/40',
      warning: 'shadow-xl shadow-amber-500/40',
      ghost: '',
      outline: 'shadow-lg shadow-slate-500/20'
    }
    
    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glow && glowStyles[variant],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Background shimmer effect */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        <div className="relative z-10 flex items-center">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <span className={cn('flex-shrink-0 transition-transform duration-200', children && 'mr-2', animated && 'group-hover:scale-110')}>
                  {icon}
                </span>
              )}
              {children}
              {icon && iconPosition === 'right' && (
                <span className={cn('flex-shrink-0 transition-transform duration-200', children && 'ml-2', animated && 'group-hover:scale-110')}>
                  {icon}
                </span>
              )}
            </>
          )}
        </div>
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