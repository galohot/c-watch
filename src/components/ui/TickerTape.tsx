'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TickerItem {
  id: string
  content: ReactNode
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'orange'
}

interface TickerTapeProps {
  items: TickerItem[]
  className?: string
  speed?: 'slow' | 'normal' | 'fast'
  separator?: string
}

export function TickerTape({
  items,
  className,
  speed = 'normal',
  separator = ' • '
}: TickerTapeProps) {
  const speedClasses = {
    slow: 'animate-[scroll_60s_linear_infinite]',
    normal: 'animate-[scroll_30s_linear_infinite]',
    fast: 'animate-[scroll_15s_linear_infinite]'
  }

  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400'
  }

  return (
    <div className={cn('ticker-tape', className)}>
      <div className={cn('ticker-content', speedClasses[speed])}>
        {items.map((item, index) => (
          <span key={`${item.id}-${index}`} className="flex items-center">
            <span className={cn(
              'font-mono text-sm',
              item.color ? colorClasses[item.color] : 'text-orange-400'
            )}>
              {item.content}
            </span>
            {index < items.length - 1 && (
              <span className="text-orange-400/50 mx-4">{separator}</span>
            )}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((item, index) => (
          <span key={`${item.id}-duplicate-${index}`} className="flex items-center">
            <span className="text-orange-400/50 mx-4">{separator}</span>
            <span className={cn(
              'font-mono text-sm',
              item.color ? colorClasses[item.color] : 'text-orange-400'
            )}>
              {item.content}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}