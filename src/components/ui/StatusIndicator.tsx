'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type StatusType = 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success' | 'critical'

interface StatusIndicatorProps {
  status: StatusType
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'dot' | 'badge' | 'pill' | 'glow'
  className?: string
  icon?: ReactNode
  pulse?: boolean
  animated?: boolean
  glow?: boolean
}

export function StatusIndicator({
  status,
  label,
  size = 'md',
  variant = 'dot',
  className,
  icon,
  pulse = false,
  animated = true,
  glow = false
}: StatusIndicatorProps) {
  const statusConfig = {
    active: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      bgColor: 'bg-emerald-500/10',
      glowColor: 'shadow-emerald-500/40',
      gradient: 'from-emerald-400 to-green-500'
    },
    inactive: {
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
      borderColor: 'border-slate-500/50',
      bgColor: 'bg-slate-500/10',
      glowColor: 'shadow-slate-500/40',
      gradient: 'from-slate-400 to-slate-600'
    },
    pending: {
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-amber-500/10',
      glowColor: 'shadow-amber-500/40',
      gradient: 'from-amber-400 to-yellow-500'
    },
    error: {
      color: 'bg-red-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/50',
      bgColor: 'bg-red-500/10',
      glowColor: 'shadow-red-500/40',
      gradient: 'from-red-400 to-red-600'
    },
    warning: {
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/50',
      bgColor: 'bg-orange-500/10',
      glowColor: 'shadow-orange-500/40',
      gradient: 'from-orange-400 to-amber-500'
    },
    success: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      bgColor: 'bg-emerald-500/10',
      glowColor: 'shadow-emerald-500/40',
      gradient: 'from-emerald-400 to-green-500'
    },
    critical: {
      color: 'bg-red-600',
      textColor: 'text-red-300',
      borderColor: 'border-red-600/50',
      bgColor: 'bg-red-600/10',
      glowColor: 'shadow-red-600/50',
      gradient: 'from-red-500 to-red-700'
    }
  }

  const sizeConfig = {
    xs: {
      dot: 'w-1.5 h-1.5',
      text: 'text-xs',
      padding: 'px-2 py-0.5',
      icon: 'w-3 h-3'
    },
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      padding: 'px-2 py-1',
      icon: 'w-3 h-3'
    },
    md: {
      dot: 'w-3 h-3',
      text: 'text-sm',
      padding: 'px-3 py-1.5',
      icon: 'w-4 h-4'
    },
    lg: {
      dot: 'w-4 h-4',
      text: 'text-base',
      padding: 'px-4 py-2',
      icon: 'w-5 h-5'
    },
    xl: {
      dot: 'w-5 h-5',
      text: 'text-lg',
      padding: 'px-5 py-2.5',
      icon: 'w-6 h-6'
    }
  }

  const config = statusConfig[status]
  const sizes = sizeConfig[size]

  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center space-x-2 group', className)}>
        <div className={cn(
          'relative rounded-full transition-all duration-300',
          config.color,
          sizes.dot,
          pulse && 'animate-pulse',
          animated && 'group-hover:scale-125',
          glow && `shadow-lg ${config.glowColor}`
        )}>
          {animated && (
            <div className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-75',
              config.color
            )} />
          )}
        </div>
        {label && (
          <span className={cn(
            'font-medium tracking-wide transition-colors duration-300',
            config.textColor,
            sizes.text,
            animated && 'group-hover:text-white'
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
        'inline-flex items-center space-x-2 border rounded-lg font-medium tracking-wide transition-all duration-300 backdrop-blur-sm',
        config.borderColor,
        config.bgColor,
        config.textColor,
        sizes.text,
        sizes.padding,
        pulse && 'animate-pulse',
        animated && 'hover:scale-105 hover:shadow-lg',
        glow && `shadow-lg ${config.glowColor}`,
        className
      )}>
        {icon && (
          <span className={cn('transition-transform duration-300', sizes.icon, animated && 'hover:scale-110')}>
            {icon}
          </span>
        )}
        <div className={cn(
          'rounded-full transition-all duration-300',
          config.color,
          'w-2 h-2',
          animated && 'hover:scale-125'
        )}></div>
        {label && <span>{label}</span>}
      </div>
    )
  }

  if (variant === 'pill') {
    return (
      <div className={cn(
        'inline-flex items-center space-x-2 rounded-full border font-medium tracking-wide transition-all duration-300 backdrop-blur-sm',
        config.borderColor,
        config.bgColor,
        config.textColor,
        sizes.text,
        sizes.padding,
        pulse && 'animate-pulse',
        animated && 'hover:scale-105 hover:shadow-lg',
        glow && `shadow-lg ${config.glowColor}`,
        className
      )}>
        {icon && (
          <span className={cn('transition-transform duration-300', sizes.icon, animated && 'hover:scale-110')}>
            {icon}
          </span>
        )}
        <div className={cn(
          'rounded-full transition-all duration-300',
          config.color,
          'w-2 h-2',
          animated && 'hover:scale-125'
        )}></div>
        {label && <span>{label}</span>}
      </div>
    )
  }
  
  if (variant === 'glow') {
    return (
      <div className={cn('relative inline-flex items-center space-x-2 group', className)}>
        <div className={cn(
          'relative rounded-full transition-all duration-500',
          config.color,
          sizes.dot,
          pulse && 'animate-pulse',
          `shadow-xl ${config.glowColor}`,
          animated && 'group-hover:scale-150'
        )}>
          <div className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-r opacity-75 animate-ping',
            `bg-gradient-to-r ${config.gradient}`
          )} />
          <div className={cn(
            'relative rounded-full',
            config.color,
            sizes.dot
          )} />
        </div>
        {label && (
          <span className={cn(
            'font-medium tracking-wide transition-all duration-300',
            config.textColor,
            sizes.text,
            animated && 'group-hover:text-white group-hover:drop-shadow-lg'
          )}>
            {label}
          </span>
        )}
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