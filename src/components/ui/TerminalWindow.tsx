'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalWindowProps {
  children: ReactNode
  title?: string
  className?: string
  showHeader?: boolean
  headerActions?: ReactNode
  variant?: 'default' | 'compact' | 'fullscreen'
  animated?: boolean
}

export function TerminalWindow({
  children,
  title = 'C-WATCH TERMINAL',
  className,
  showHeader = true,
  headerActions,
  variant = 'default',
  animated = false
}: TerminalWindowProps) {
  const variantStyles = {
    default: 'p-6',
    compact: 'p-4',
    fullscreen: 'p-8'
  }
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm shadow-xl',
      animated && 'transition-all duration-300 hover:shadow-2xl hover:border-slate-600/50',
      className
    )}>
      {/* Animated background */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse" />
      )}
      
      {showHeader && (
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50 transition-all duration-200 hover:shadow-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 transition-all duration-200 hover:shadow-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 transition-all duration-200 hover:shadow-emerald-500/80"></div>
            </div>
            <span className="text-slate-200 font-medium text-sm tracking-wide">
              {title}
            </span>
          </div>
          {headerActions && (
            <div className="flex items-center space-x-3">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      <div className={cn('relative z-10', variantStyles[variant])}>
        {children}
      </div>
      
      {/* Corner glow effect */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-xl" />
    </div>
  )
}