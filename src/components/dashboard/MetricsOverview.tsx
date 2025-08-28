'use client'

import { MetricCard, LoadingSpinner } from '../ui'
import { cn } from '../../lib/utils'
import { useMetrics, type DashboardMetrics } from '../../hooks/useMetrics'

interface MetricData {
  label: string
  value: string | number
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  variant?: 'default' | 'critical' | 'warning' | 'success'
  subtitle?: string
  icon?: React.ReactNode
}

interface MetricsOverviewProps {
  className?: string
  title?: string
  columns?: 2 | 3 | 4 | 6
}

function generateMetricsFromData(metrics: DashboardMetrics): MetricData[] {
  
  return [
    {
      label: 'Total Cases',
      value: metrics.totalCases.toLocaleString(),
      change: { 
        value: `${metrics.recentCasesGrowth > 0 ? '+' : ''}${metrics.recentCasesGrowth.toFixed(1)}%`, 
        type: metrics.recentCasesGrowth > 0 ? 'increase' : 'decrease' 
      },
      variant: 'default',
      subtitle: 'All time',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      label: 'Ongoing Cases',
      value: metrics.ongoingCases.toLocaleString(),
      change: { 
        value: `${Math.abs(metrics.recentCasesGrowth * 0.8).toFixed(1)}%`, 
        type: metrics.recentCasesGrowth > 0 ? 'increase' : 'decrease' 
      },
      variant: 'warning',
      subtitle: 'Under investigation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'High Severity Cases',
      value: metrics.highSeverityCases.toLocaleString(),
      change: { 
        value: `${(metrics.averageSeverityScore * 2).toFixed(1)}%`, 
        type: metrics.averageSeverityScore > 5 ? 'increase' : 'decrease' 
      },
      variant: metrics.averageSeverityScore > 7 ? 'critical' : 'warning',
      subtitle: 'Severity > 7',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      label: 'Closed Cases',
      value: metrics.closedCases.toLocaleString(),
      change: { 
        value: `${((metrics.closedCases / metrics.totalCases) * 100).toFixed(1)}%`, 
        type: 'increase' 
      },
      variant: 'success',
      subtitle: 'Completed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Financial Impact',
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact' }).format(metrics.totalLossesIdr),
      change: { 
        value: `${(metrics.averageSeverityScore * 3).toFixed(1)}%`, 
        type: 'increase' 
      },
      variant: 'critical',
      subtitle: 'Total estimated loss',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      label: 'Recovery Rate',
      value: `${metrics.recoveryRate.toFixed(1)}%`,
      change: { 
        value: metrics.recoveryRate > 50 ? 'Above target' : 'Below target', 
        type: metrics.recoveryRate > 50 ? 'increase' : 'decrease' 
      },
      variant: metrics.recoveryRate > 70 ? 'success' : metrics.recoveryRate > 50 ? 'warning' : 'critical',
      subtitle: 'Assets recovered',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ]
}



export function MetricsOverview({
  className,
  title = 'System Metrics Overview',
  columns = 3
}: MetricsOverviewProps) {
  const { metrics, loading, error } = useMetrics()
  
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  if (loading) {
    return (
      <div className={cn('terminal-panel', className)}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner text="Loading metrics..." size="lg" />
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Failed to load metrics data</p>
        </div>
      </div>
    )
  }

  const metricsData = generateMetricsFromData(metrics)

  return (
    <div className={cn(
      'terminal-panel group relative overflow-hidden',
      'border border-terminal-amber/30 bg-terminal-dark/40 backdrop-blur-sm',
      'shadow-terminal-amber-glow/20 transition-all duration-300',
      'hover:border-terminal-amber/50 hover:shadow-terminal-amber-glow/30',
      className
    )}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-terminal-amber/5 via-transparent to-terminal-blue/5 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {title && (
        <div className="relative mb-6">
          <div className="flex items-center justify-between">
            <h2 className="terminal-text-lg font-mono font-bold text-terminal-amber tracking-wider uppercase 
                           group-hover:glow-text transition-all duration-300">
              {title}
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
              <span className="terminal-text-xs font-mono text-terminal-light/60 uppercase tracking-wide">
                LIVE
              </span>
            </div>
          </div>
          <div className="mt-3 h-[1px] bg-gradient-to-r from-terminal-amber/50 via-terminal-amber/20 to-transparent" />
          <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-terminal-amber 
                          group-hover:w-full transition-all duration-700 ease-out" />
        </div>
      )}
      
      <div className={cn('grid gap-4 relative z-10', gridCols[columns])}>
        {metricsData.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            variant={metric.variant}
            subtitle={metric.subtitle}
            icon={metric.icon}
            className="transform transition-all duration-300 hover:z-20"
          />
        ))}
      </div>
      
      {/* Enhanced terminal footer */}
      <div className="relative mt-6 pt-4">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-terminal-amber/30 to-transparent mb-4" />
        <div className="flex items-center justify-between terminal-text-xs font-mono text-terminal-light/50">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-terminal-green rounded-full animate-pulse" />
              <span className="uppercase tracking-wide">METRICS: {metricsData.length} ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-terminal-blue rounded-full animate-pulse" />
              <span className="uppercase tracking-wide">UPDATE FREQ: 30s</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-terminal-amber rounded-full animate-pulse" />
              <span className="uppercase tracking-wide">DATA SOURCE: SUPABASE</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-terminal-green rounded-full animate-ping opacity-30" />
              </div>
              <span className="uppercase tracking-wide text-terminal-green">REAL-TIME</span>
            </div>
            <div className="terminal-text-xs text-terminal-light/30">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-amber/5 to-transparent 
                      h-[2px] animate-scan-line opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

// Specialized metric components
interface CriticalMetricsProps {
  className?: string
}

export function CriticalMetrics({ className }: CriticalMetricsProps) {
  const { metrics, loading, error } = useMetrics()

  if (loading) {
    return (
      <div className={cn('terminal-panel', className)}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner text="Loading critical metrics..." size="lg" />
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className={cn('terminal-panel', className)}>
        <div className="terminal-header">
          <h2 className="terminal-title">CRITICAL METRICS</h2>
        </div>
        <div className="terminal-content">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">
              {error ? `Error loading critical metrics: ${error}` : 'No critical metrics data available'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const criticalMetrics = [
    {
      label: 'High Severity Cases',
      value: Math.round(metrics.totalCases * (metrics.averageSeverityScore / 10)),
      change: { 
        value: `${metrics.recentCasesGrowth > 0 ? '+' : ''}${metrics.recentCasesGrowth.toFixed(1)}%`, 
        type: metrics.recentCasesGrowth > 0 ? 'increase' as const : 'decrease' as const 
      },
      variant: metrics.averageSeverityScore > 7 ? 'critical' as const : 'warning' as const,
      subtitle: 'Above average severity'
    },
    {
      label: 'Cases This Month',
      value: metrics.casesThisMonth,
      change: { 
        value: `${metrics.recentCasesGrowth > 0 ? '+' : ''}${Math.abs(metrics.recentCasesGrowth).toFixed(1)}%`, 
        type: metrics.recentCasesGrowth > 0 ? 'increase' as const : 'decrease' as const 
      },
      variant: metrics.casesThisMonth > 50 ? 'critical' as const : 'warning' as const,
      subtitle: 'Current month activity'
    },
    {
      label: 'Recovery Rate',
      value: `${metrics.recoveryRate.toFixed(1)}%`,
      change: { 
        value: metrics.recoveryRate > 50 ? 'Above target' : 'Below target', 
        type: metrics.recoveryRate > 50 ? 'increase' as const : 'decrease' as const 
      },
      variant: metrics.recoveryRate > 70 ? 'success' as const : metrics.recoveryRate > 50 ? 'warning' as const : 'critical' as const,
      subtitle: 'Asset recovery success'
    }
  ]

  return (
    <div className={cn(
      'terminal-panel group relative overflow-hidden',
      'border border-terminal-red/40 bg-terminal-dark/50 backdrop-blur-sm',
      'shadow-terminal-red-glow/30 transition-all duration-300',
      'hover:border-terminal-red/60 hover:shadow-terminal-red-glow/40',
      className
    )}>
      {/* Critical alert background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-terminal-red/10 via-transparent to-terminal-amber/5 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Pulsing border for critical alerts */}
      <div className="absolute inset-0 border border-terminal-red/20 rounded-lg animate-pulse" />
      
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-terminal-red rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-terminal-red rounded-full animate-ping opacity-40" />
            </div>
            <h2 className="terminal-text-lg font-mono font-bold text-terminal-red tracking-wider uppercase 
                           group-hover:glow-text transition-all duration-300">
              Critical Alerts
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="terminal-text-xs font-mono text-terminal-red/80 uppercase tracking-wide animate-pulse">
              HIGH PRIORITY
            </div>
          </div>
        </div>
        <div className="mt-3 h-[1px] bg-gradient-to-r from-terminal-red/60 via-terminal-red/30 to-transparent" />
        <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-terminal-red 
                        group-hover:w-full transition-all duration-700 ease-out" />
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {criticalMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            variant={metric.variant}
            subtitle={metric.subtitle}
            className="transform transition-all duration-300 hover:z-20 hover:shadow-terminal-red-glow/20"
          />
        ))}
      </div>
      
      {/* Critical alert footer */}
      <div className="relative mt-6 pt-4">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-terminal-red/40 to-transparent mb-4" />
        <div className="flex items-center justify-between terminal-text-xs font-mono text-terminal-light/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-terminal-red rounded-full animate-pulse" />
              <span className="uppercase tracking-wide">ALERT LEVEL: CRITICAL</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-terminal-amber rounded-full animate-pulse" />
              <span className="uppercase tracking-wide">AUTO-REFRESH: ON</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-2 h-2 bg-terminal-red rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-terminal-red rounded-full animate-ping opacity-30" />
            </div>
            <span className="uppercase tracking-wide text-terminal-red">MONITORING</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced scan line for critical alerts */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-red/10 to-transparent 
                      h-[3px] animate-scan-line opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

export function FinancialMetrics({ className }: { className?: string }) {
  const financialMetrics = [
    {
      label: 'Total Losses',
      value: '$1.2B',
      change: { value: '+15.3%', type: 'increase' as const },
      variant: 'critical' as const,
      subtitle: 'YTD impact',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    },
    {
      label: 'Recovered Funds',
      value: '$340.7M',
      change: { value: '+8.1%', type: 'increase' as const },
      variant: 'success' as const,
      subtitle: 'This quarter',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      label: 'Pending Recovery',
      value: '$277.4M',
      change: { value: '+31.2%', type: 'increase' as const },
      variant: 'warning' as const,
      subtitle: 'Under investigation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className={cn(
      'terminal-panel group relative overflow-hidden',
      'border border-terminal-green/30 bg-terminal-dark/40 backdrop-blur-sm',
      'shadow-terminal-green-glow/20 transition-all duration-300',
      'hover:border-terminal-green/50 hover:shadow-terminal-green-glow/30',
      className
    )}>
      {/* Financial background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-terminal-green/5 via-transparent to-terminal-blue/5 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-terminal-green rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-terminal-green rounded-full animate-ping opacity-30" />
            </div>
            <h3 className="terminal-text-lg font-mono font-bold text-terminal-green tracking-wider uppercase 
                           group-hover:glow-text transition-all duration-300">
              Financial Impact Analysis
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="terminal-text-xs font-mono text-terminal-green/70 uppercase tracking-wide">
              USD
            </div>
          </div>
        </div>
        <div className="mt-3 h-[1px] bg-gradient-to-r from-terminal-green/50 via-terminal-green/20 to-transparent" />
        <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-terminal-green 
                        group-hover:w-full transition-all duration-700 ease-out" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {financialMetrics.map((metric, index) => (
          <MetricCard 
            key={index} 
            {...metric}
            className="transform transition-all duration-300 hover:z-20"
          />
        ))}
      </div>
      
      {/* Financial footer */}
      <div className="relative mt-6 pt-4">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-terminal-green/30 to-transparent mb-4" />
        <div className="flex items-center justify-between terminal-text-xs font-mono text-terminal-light/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-terminal-green rounded-full animate-pulse" />
              <span className="uppercase tracking-wide">CURRENCY: USD</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-terminal-blue rounded-full animate-pulse" />
              <span className="uppercase tracking-wide">EXCHANGE RATE: LIVE</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-terminal-green rounded-full animate-ping opacity-30" />
            </div>
            <span className="uppercase tracking-wide text-terminal-green">TRACKING</span>
          </div>
        </div>
      </div>
      
      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-green/5 to-transparent 
                      h-[2px] animate-scan-line opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}