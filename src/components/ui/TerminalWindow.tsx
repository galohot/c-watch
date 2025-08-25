'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TerminalWindowProps {
  children: ReactNode
  title?: string
  className?: string
  showHeader?: boolean
  headerActions?: ReactNode
}

export function TerminalWindow({
  children,
  title = 'C-WATCH TERMINAL',
  className,
  showHeader = true,
  headerActions
}: TerminalWindowProps) {
  return (
    <div className={cn('terminal-window', className)}>
      {showHeader && (
        <div className="terminal-header">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-orange-400 font-mono text-sm font-semibold">
              {title}
            </span>
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}