'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  variant?: 'default' | 'search' | 'filter'
  loading?: boolean
}

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ className, label, error, icon, variant = 'default', loading, ...props }, ref) => {
    const variantStyles = {
      default: 'terminal-input',
      search: 'terminal-input pl-10',
      filter: 'terminal-input bg-orange-400/5'
    }

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm text-orange-400/70 uppercase tracking-wider font-semibold">
            {label}
          </label>
        )}
        
        <div className="relative">
          {(icon || variant === 'search') && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400/50">
              {icon || (
                variant === 'search' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              )}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              variantStyles[variant],
              error && 'border-red-400 focus:border-red-400 focus:ring-red-400/50',
              loading && 'opacity-50 cursor-not-allowed',
              className
            )}
            disabled={loading}
            {...props}
          />
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-red-400 text-xs font-mono">
            {error}
          </p>
        )}
      </div>
    )
  }
)

TerminalInput.displayName = 'TerminalInput'