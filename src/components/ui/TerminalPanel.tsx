'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalPanelProps {
  children: ReactNode
  title?: string
  className?: string
  variant?: 'default' | 'highlighted' | 'warning' | 'error'
  showBorder?: boolean
}

export function TerminalPanel({
  children,
  title,
  className,
  variant = 'default',
  showBorder = true
}: TerminalPanelProps) {
  const variantStyles = {
    default: 'border-orange-400/20',
    highlighted: 'border-orange-400/50 terminal-border-glow',
    warning: 'border-yellow-400/50',
    error: 'border-red-400/50'
  }

  return (
    <div 
      className={cn(
        'terminal-panel',
        showBorder && variantStyles[variant],
        className
      )}
    >
      {title && (
        <div className="mb-3 pb-2 border-b border-orange-400/20">
          <h3 className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  )
}