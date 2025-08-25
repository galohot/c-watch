'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type StatusType = 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success' | 'critical'

interface StatusIndicatorProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dot' | 'badge' | 'pill'
  className?: string
  icon?: ReactNode
  pulse?: boolean
}

export function StatusIndicator({
  status,
  label,
  size = 'md',
  variant = 'dot',
  className,
  icon,
  pulse = false
}: StatusIndicatorProps) {
  const statusConfig = {
    active: {
      color: 'bg-green-400',
      textColor: 'text-green-400',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-400/10'
    },
    inactive: {
      color: 'bg-gray-500',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500',
      bgColor: 'bg-gray-500/10'
    },
    pending: {
      color: 'bg-yellow-400',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    error: {
      color: 'bg-red-400',
      textColor: 'text-red-400',
      borderColor: 'border-red-400',
      bgColor: 'bg-red-400/10'
    },
    warning: {
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    success: {
      color: 'bg-green-400',
      textColor: 'text-green-400',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-400/10'
    },
    critical: {
      color: 'bg-red-500',
      textColor: 'text-red-500',
      borderColor: 'border-red-500',
      bgColor: 'bg-red-500/10'
    }
  }

  const sizeConfig = {
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      padding: 'px-2 py-1'
    },
    md: {
      dot: 'w-3 h-3',
      text: 'text-sm',
      padding: 'px-3 py-1'
    },
    lg: {
      dot: 'w-4 h-4',
      text: 'text-base',
      padding: 'px-4 py-2'
    }
  }

  const config = statusConfig[status]
  const sizes = sizeConfig[size]

  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className={cn(
          'rounded-full',
          config.color,
          sizes.dot,
          pulse && 'animate-pulse'
        )}></div>
        {label && (
          <span className={cn(
            'font-mono uppercase tracking-wider',
            config.textColor,
            sizes.text
          )}>
            {label}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'badge') {
    return (
      <div className={cn(
        'inline-flex items-center space-x-1 border font-mono uppercase tracking-wider',
        config.borderColor,
        config.bgColor,
        config.textColor,
        sizes.text,
        sizes.padding,
        pulse && 'animate-pulse',
        className
      )}>
        {icon && <span>{icon}</span>}
        <div className={cn('rounded-full', config.color, 'w-2 h-2')}></div>
        {label && <span>{label}</span>}
      </div>
    )
  }

  if (variant === 'pill') {
    return (
      <div className={cn(
        'inline-flex items-center space-x-1 rounded-full border font-mono uppercase tracking-wider',
        config.borderColor,
        config.bgColor,
        config.textColor,
        sizes.text,
        sizes.padding,
        pulse && 'animate-pulse',
        className
      )}>
        {icon && <span>{icon}</span>}
        <div className={cn('rounded-full', config.color, 'w-2 h-2')}></div>
        {label && <span>{label}</span>}
      </div>
    )
  }

  return null
}

// Predefined status components
export function OnlineStatus({ className }: { className?: string }) {
  return (
    <StatusIndicator
      status="active"
      label="ONLINE"
      variant="badge"
      pulse
      className={className}
    />
  )
}

export function OfflineStatus({ className }: { className?: string }) {
  return (
    <StatusIndicator
      status="inactive"
      label="OFFLINE"
      variant="badge"
      className={className}
    />
  )
}

export function SystemStatus({ 
  status, 
  className 
}: { 
  status: 'operational' | 'degraded' | 'down'
  className?: string 
}) {
  const statusMap = {
    operational: 'active',
    degraded: 'warning',
    down: 'error'
  } as const

  const labelMap = {
    operational: 'OPERATIONAL',
    degraded: 'DEGRADED',
    down: 'DOWN'
  }

  return (
    <StatusIndicator
      status={statusMap[status]}
      label={labelMap[status]}
      variant="pill"
      className={className}
    />
  )
}