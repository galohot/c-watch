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
    default: {
      border: 'border-slate-600/50',
      bg: 'bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-slate-800/90',
      glow: 'shadow-xl shadow-blue-500/10',
      accent: 'text-blue-400',
      accentGradient: 'from-blue-400 to-cyan-400'
    },
    critical: {
      border: 'border-red-500/50',
      bg: 'bg-gradient-to-br from-red-900/20 via-slate-800/90 to-red-900/20',
      glow: 'shadow-xl shadow-red-500/20',
      accent: 'text-red-400',
      accentGradient: 'from-red-400 to-pink-400'
    },
    warning: {
      border: 'border-amber-500/50',
      bg: 'bg-gradient-to-br from-amber-900/20 via-slate-800/90 to-amber-900/20',
      glow: 'shadow-xl shadow-amber-500/20',
      accent: 'text-amber-400',
      accentGradient: 'from-amber-400 to-yellow-400'
    },
    success: {
      border: 'border-emerald-500/50',
      bg: 'bg-gradient-to-br from-emerald-900/20 via-slate-800/90 to-emerald-900/20',
      glow: 'shadow-xl shadow-emerald-500/20',
      accent: 'text-emerald-400',
      accentGradient: 'from-emerald-400 to-green-400'
    }
  }

  const changeColors = {
    increase: 'text-emerald-400',
    decrease: 'text-red-400',
    neutral: 'text-slate-400'
  }

  const changeSymbols = {
    increase: '↗',
    decrease: '↘',
    neutral: '→'
  }

  const currentVariant = variantStyles[variant]

  if (loading) {
    return (
      <div className={cn(
        'group relative overflow-hidden rounded-xl p-6',
        'border backdrop-blur-xl transition-all duration-500',
        'hover:scale-[1.02] hover:shadow-2xl',
        currentVariant.border,
        currentVariant.bg,
        currentVariant.glow,
        className
      )}>
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping" />
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </div>
          {icon && (
            <div className={cn('transition-all duration-300 group-hover:scale-110', currentVariant.accent)}>
              {icon}
            </div>
          )}
        </div>
        
        {/* Loading content */}
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-spin">
            <div className="w-full h-full rounded-full border-2 border-transparent border-t-white/30" />
          </div>
          <span className="text-sm font-medium text-slate-400 animate-pulse">
            Loading data...
          </span>
        </div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 
                        animate-pulse opacity-50" />
      </div>
    )
  }

  return (
    <div className={cn(
      'group relative overflow-hidden cursor-pointer rounded-xl p-6',
      'border backdrop-blur-xl transition-all duration-500',
      'hover:scale-[1.03] hover:shadow-2xl hover:border-opacity-80',
      'active:scale-[0.98] active:transition-none',
      'transform-gpu will-change-transform',
      currentVariant.border,
      currentVariant.bg,
      currentVariant.glow,
      className
    )}>
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn('absolute top-3 right-3 w-1 h-1 rounded-full animate-ping', currentVariant.accent)} />
        <div className={cn('absolute bottom-6 left-6 w-1 h-1 rounded-full animate-pulse', currentVariant.accent)} />
        <div className={cn('absolute top-1/2 right-6 w-0.5 h-0.5 rounded-full animate-bounce', currentVariant.accent)} />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-slate-300 
                        group-hover:text-white transition-colors duration-300">
          {label}
        </div>
        {icon && (
          <div className={cn(
            'transition-all duration-300 group-hover:scale-110 group-hover:rotate-12',
            'p-2 rounded-lg bg-white/5 group-hover:bg-white/10',
            currentVariant.accent
          )}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Main value */}
      <div className={cn(
        'text-3xl font-bold mb-3 transition-all duration-300',
        'bg-gradient-to-r bg-clip-text text-transparent',
        'group-hover:scale-105 group-hover:drop-shadow-lg',
        `bg-gradient-to-r ${currentVariant.accentGradient}`
      )}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {/* Subtitle */}
      {subtitle && (
        <div className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide 
                        group-hover:text-slate-300 transition-colors duration-300">
          {subtitle}
        </div>
      )}
      
      {/* Change indicator */}
      {change && (
        <div className={cn(
          'flex items-center space-x-2 text-sm font-semibold',
          'transition-all duration-300 group-hover:scale-105',
          'px-3 py-1 rounded-full bg-white/5 group-hover:bg-white/10',
          changeColors[change.type]
        )}>
          <span className="text-lg transition-transform duration-300 group-hover:scale-125">
            {changeSymbols[change.type]}
          </span>
          <span>{change.value}</span>
        </div>
      )}
      
      {/* Glowing border effect */}
      <div className={cn(
        'absolute inset-0 rounded-xl border-2 border-transparent',
        'bg-gradient-to-r opacity-0 group-hover:opacity-100',
        'transition-opacity duration-500',
        `bg-gradient-to-r ${currentVariant.accentGradient}`,
        'p-[1px]'
      )}>
        <div className="w-full h-full rounded-xl bg-slate-900" />
      </div>
      
      {/* Corner accent glow */}
      <div className={cn(
        'absolute top-0 right-0 w-8 h-8 rounded-bl-full',
        'bg-gradient-to-bl opacity-20 group-hover:opacity-40',
        'transition-all duration-500 group-hover:scale-150',
        `bg-gradient-to-bl ${currentVariant.accentGradient}`
      )} />
      
      {/* Bottom glow line */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-[2px] rounded-full',
        'bg-gradient-to-r opacity-0 group-hover:opacity-60',
        'transition-all duration-500',
        `bg-gradient-to-r ${currentVariant.accentGradient}`
      )} />
    </div>
  )
}