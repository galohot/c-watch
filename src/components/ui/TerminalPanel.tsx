'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalPanelProps {
  children: ReactNode
  title?: string
  className?: string
  variant?: 'default' | 'highlighted' | 'warning' | 'error' | 'success' | 'info'
  showBorder?: boolean
  showGlow?: boolean
  animated?: boolean
}

export function TerminalPanel({
  children,
  title,
  className,
  variant = 'default',
  showBorder = true,
  showGlow = false,
  animated = false
}: TerminalPanelProps) {
  const variantStyles = {
    default: {
      border: 'border-slate-700/50',
      bg: 'bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90',
      glow: 'shadow-lg shadow-slate-900/50',
      title: 'text-slate-300'
    },
    highlighted: {
      border: 'border-blue-500/50',
      bg: 'bg-gradient-to-br from-blue-900/20 via-slate-800/90 to-slate-900/90',
      glow: 'shadow-lg shadow-blue-500/20',
      title: 'text-blue-400'
    },
    warning: {
      border: 'border-amber-500/50',
      bg: 'bg-gradient-to-br from-amber-900/20 via-slate-800/90 to-slate-900/90',
      glow: 'shadow-lg shadow-amber-500/20',
      title: 'text-amber-400'
    },
    error: {
      border: 'border-red-500/50',
      bg: 'bg-gradient-to-br from-red-900/20 via-slate-800/90 to-slate-900/90',
      glow: 'shadow-lg shadow-red-500/20',
      title: 'text-red-400'
    },
    success: {
      border: 'border-emerald-500/50',
      bg: 'bg-gradient-to-br from-emerald-900/20 via-slate-800/90 to-slate-900/90',
      glow: 'shadow-lg shadow-emerald-500/20',
      title: 'text-emerald-400'
    },
    info: {
      border: 'border-cyan-500/50',
      bg: 'bg-gradient-to-br from-cyan-900/20 via-slate-800/90 to-slate-900/90',
      glow: 'shadow-lg shadow-cyan-500/20',
      title: 'text-cyan-400'
    }
  }

  const currentVariant = variantStyles[variant]

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl backdrop-blur-sm transition-all duration-300',
        currentVariant.bg,
        showBorder && currentVariant.border,
        showBorder && 'border',
        showGlow && currentVariant.glow,
        animated && 'hover:scale-[1.02] hover:shadow-xl',
        'p-6',
        className
      )}
    >
      {/* Animated background shimmer */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {title && (
          <div className="mb-4 pb-3 border-b border-slate-700/50">
            <h3 className={cn(
              'font-semibold text-sm uppercase tracking-wider transition-colors duration-200',
              currentVariant.title
            )}>
              {title}
            </h3>
          </div>
        )}
        {children}
      </div>
      
      {/* Corner accent */}
      <div className={cn(
        'absolute top-0 right-0 w-16 h-16 opacity-20',
        variant === 'highlighted' && 'bg-gradient-to-bl from-blue-500/30 to-transparent',
        variant === 'warning' && 'bg-gradient-to-bl from-amber-500/30 to-transparent',
        variant === 'error' && 'bg-gradient-to-bl from-red-500/30 to-transparent',
        variant === 'success' && 'bg-gradient-to-bl from-emerald-500/30 to-transparent',
        variant === 'info' && 'bg-gradient-to-bl from-cyan-500/30 to-transparent',
        variant === 'default' && 'bg-gradient-to-bl from-slate-500/30 to-transparent'
      )} />
    </div>
  )
}