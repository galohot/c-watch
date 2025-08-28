'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  icon?: ReactNode
  variant?: 'default' | 'search' | 'filter' | 'password' | 'email'
  loading?: boolean
  glow?: boolean
  animated?: boolean
}

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ className, label, error, success, icon, variant = 'default', loading, glow = false, animated = true, ...props }, ref) => {
    const baseStyles = cn(
      'w-full px-4 py-3 rounded-lg border bg-slate-900/50 backdrop-blur-sm text-slate-200 placeholder-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
      animated && 'transform focus:scale-[1.02]'
    )
    
    const variantStyles = {
      default: 'border-slate-600/50 focus:border-slate-500/50 focus:ring-slate-400/50',
      search: 'pl-12 border-slate-600/50 focus:border-blue-500/50 focus:ring-blue-400/50',
      filter: 'border-slate-600/50 bg-slate-800/30 focus:border-purple-500/50 focus:ring-purple-400/50',
      password: 'border-slate-600/50 focus:border-amber-500/50 focus:ring-amber-400/50',
      email: 'border-slate-600/50 focus:border-emerald-500/50 focus:ring-emerald-400/50'
    }
    
    const stateStyles = {
      error: 'border-red-500/50 focus:border-red-400/50 focus:ring-red-400/50 bg-red-900/10',
      success: 'border-emerald-500/50 focus:border-emerald-400/50 focus:ring-emerald-400/50 bg-emerald-900/10',
      normal: ''
    }
    
    const glowStyles = {
      default: 'shadow-lg shadow-slate-500/20',
      search: 'shadow-lg shadow-blue-500/20',
      filter: 'shadow-lg shadow-purple-500/20',
      password: 'shadow-lg shadow-amber-500/20',
      email: 'shadow-lg shadow-emerald-500/20'
    }
    
    const getState = () => {
      if (error) return 'error'
      if (success) return 'success'
      return 'normal'
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm text-slate-300 font-medium tracking-wide">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {/* Background glow effect */}
          {glow && (
            <div className={cn('absolute inset-0 rounded-lg blur-sm opacity-50', glowStyles[variant])} />
          )}
          
          {(icon || variant === 'search') && (
            <div className={cn(
              'absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200',
              error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-slate-400 group-focus-within:text-slate-300'
            )}>
              {icon || (
                variant === 'search' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              )}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              baseStyles,
              variantStyles[variant],
              stateStyles[getState()],
              glow && glowStyles[variant],
              className
            )}
            disabled={loading}
            {...props}
          />
          
          {/* Status indicators */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            )}
            {success && !loading && (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {error && !loading && (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          {/* Animated border effect */}
          {animated && (
            <div className="absolute inset-0 rounded-lg border border-transparent bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>
        
        {error && (
          <p className="text-red-400 text-sm flex items-center space-x-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        
        {success && !error && (
          <p className="text-emerald-400 text-sm flex items-center space-x-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Input is valid</span>
          </p>
        )}
      </div>
    )
  }
)

TerminalInput.displayName = 'TerminalInput'