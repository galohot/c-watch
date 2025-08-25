'use client'

import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  variant?: 'spinner' | 'dots' | 'pulse'
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce"></div>
        </div>
        {text && (
          <span className="text-orange-400/70 font-mono text-sm ml-2">
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className={cn(
          'bg-orange-400 rounded-full animate-pulse',
          sizeClasses[size]
        )}></div>
        {text && (
          <span className="text-orange-400/70 font-mono text-sm">
            {text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin',
        sizeClasses[size]
      )}></div>
      {text && (
        <span className="text-orange-400/70 font-mono text-sm">
          {text}
        </span>
      )}
    </div>
  )
}

// Terminal-style loading messages
export function TerminalLoader({ message = 'Loading' }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2 font-mono text-orange-400">
      <span>{message}</span>
      <span className="animate-blink">_</span>
    </div>
  )
}

// Full screen loading overlay
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="terminal-panel text-center">
        <LoadingSpinner size="lg" className="justify-center mb-4" />
        <p className="text-orange-400 font-mono">{message}</p>
      </div>
    </div>
  )
}