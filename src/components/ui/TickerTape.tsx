'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TickerItem {
  id: string
  content: ReactNode
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'purple' | 'cyan' | 'emerald'
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface TickerTapeProps {
  items: TickerItem[]
  className?: string
  speed?: 'slow' | 'normal' | 'fast'
  separator?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export function TickerTape({
  items,
  className,
  speed = 'normal',
  separator = ' • ',
  variant = 'default'
}: TickerTapeProps) {
  const speedClasses = {
    slow: 'animate-[scroll_80s_linear_infinite]',
    normal: 'animate-[scroll_40s_linear_infinite]',
    fast: 'animate-[scroll_20s_linear_infinite]'
  }

  const colorClasses = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    yellow: 'text-amber-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400'
  }

  const priorityClasses = {
    low: 'opacity-70',
    medium: 'opacity-85',
    high: 'opacity-100 font-semibold',
    critical: 'opacity-100 font-bold animate-pulse'
  }

  const variantClasses = {
    default: 'py-3 px-4',
    compact: 'py-2 px-3',
    detailed: 'py-4 px-6'
  }

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm',
      variantClasses[variant],
      className
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
      
      <div className="relative overflow-hidden">
        <div className={cn(
          'flex items-center whitespace-nowrap',
          speedClasses[speed]
        )}>
          {items.map((item, index) => (
            <span key={`${item.id}-${index}`} className="flex items-center shrink-0">
              <span className={cn(
                'font-medium text-sm transition-all duration-300 hover:scale-105',
                item.color ? colorClasses[item.color] : 'text-slate-300',
                item.priority ? priorityClasses[item.priority] : '',
                variant === 'detailed' && 'text-base',
                variant === 'compact' && 'text-xs'
              )}>
                {item.content}
              </span>
              {index < items.length - 1 && (
                <span className="text-slate-500 mx-4 text-sm">{separator}</span>
              )}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {items.map((item, index) => (
            <span key={`${item.id}-duplicate-${index}`} className="flex items-center shrink-0">
              <span className="text-slate-500 mx-4 text-sm">{separator}</span>
              <span className={cn(
                'font-medium text-sm transition-all duration-300 hover:scale-105',
                item.color ? colorClasses[item.color] : 'text-slate-300',
                item.priority ? priorityClasses[item.priority] : '',
                variant === 'detailed' && 'text-base',
                variant === 'compact' && 'text-xs'
              )}>
                {item.content}
              </span>
            </span>
          ))}
        </div>
      </div>
      
      {/* Edge fade effects */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/90 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/90 to-transparent pointer-events-none" />
    </div>
  )
}