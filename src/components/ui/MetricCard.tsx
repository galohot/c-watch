'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: ReactNode
  className?: string
  variant?: 'default' | 'critical' | 'warning' | 'success'
  subtitle?: string
  loading?: boolean
}

export function MetricCard({
  label,
  value,
  change,
  icon,
  className,
  variant = 'default',
  subtitle,
  loading = false
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-orange-400/20',
    critical: 'border-red-400/50 bg-red-400/5',
    warning: 'border-yellow-400/50 bg-yellow-400/5',
    success: 'border-green-400/50 bg-green-400/5'
  }

  const changeColors = {
    increase: 'text-green-400',
    decrease: 'text-red-400',
    neutral: 'text-orange-400/70'
  }

  const changeSymbols = {
    increase: '▲',
    decrease: '▼',
    neutral: '●'
  }

  if (loading) {
    return (
      <div className={cn('metric-card', variantStyles[variant], className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="metric-label">{label}</div>
          {icon && <div className="text-orange-400/50">{icon}</div>}
        </div>
        <div className="flex items-center space-x-2">
          <div className="loading-spinner"></div>
          <span className="text-orange-400/50 font-mono">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('metric-card', variantStyles[variant], className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="metric-label">{label}</div>
        {icon && <div className="text-orange-400/70">{icon}</div>}
      </div>
      
      <div className="metric-value text-orange-400">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {subtitle && (
        <div className="text-xs text-orange-400/60 mt-1">
          {subtitle}
        </div>
      )}
      
      {change && (
        <div className={cn(
          'flex items-center space-x-1 mt-2 text-sm font-mono',
          changeColors[change.type]
        )}>
          <span>{changeSymbols[change.type]}</span>
          <span>{change.value}</span>
        </div>
      )}
    </div>
  )
}