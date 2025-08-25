'use client'

import { MetricCard, LoadingSpinner } from '../ui'
import { cn } from '../../lib/utils'

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
  metrics?: MetricData[]
  loading?: boolean
  className?: string
  title?: string
  columns?: 2 | 3 | 4 | 6
}

const defaultMetrics: MetricData[] = [
  {
    label: 'Total Cases',
    value: '2,847',
    change: { value: '+12.5%', type: 'increase' },
    variant: 'default',
    subtitle: 'All time',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    label: 'Active Cases',
    value: '342',
    change: { value: '+8.2%', type: 'increase' },
    variant: 'warning',
    subtitle: 'Under investigation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    label: 'Critical Cases',
    value: '89',
    change: { value: '+15.3%', type: 'increase' },
    variant: 'critical',
    subtitle: 'High priority',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  },
  {
    label: 'Resolved Cases',
    value: '2,416',
    change: { value: '+5.7%', type: 'increase' },
    variant: 'success',
    subtitle: 'Closed successfully',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    label: 'Financial Impact',
    value: '$847.2M',
    change: { value: '+23.1%', type: 'increase' },
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
    value: '67.3%',
    change: { value: '+2.1%', type: 'increase' },
    variant: 'success',
    subtitle: 'Assets recovered',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }
]

export function MetricsOverview({
  metrics = defaultMetrics,
  loading = false,
  className,
  title = 'System Metrics Overview',
  columns = 3
}: MetricsOverviewProps) {
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

  return (
    <div className={cn('terminal-panel', className)}>
      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-orange-400 font-mono tracking-wider uppercase">
            {title}
          </h2>
          <div className="mt-2 border-b border-orange-400/20"></div>
        </div>
      )}
      
      <div className={cn('grid gap-4', gridCols[columns])}>
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            variant={metric.variant}
            subtitle={metric.subtitle}
            icon={metric.icon}
            className="transition-all duration-200 hover:scale-105 hover:border-orange-400/40"
          />
        ))}
      </div>
      
      {/* Terminal-style footer */}
      <div className="mt-6 pt-4 border-t border-orange-400/20">
        <div className="flex items-center justify-between text-xs font-mono text-orange-400/50">
          <div className="flex items-center space-x-4">
            <span>METRICS: {metrics.length} ACTIVE</span>
            <span>UPDATE FREQ: 30s</span>
            <span>DATA SOURCE: LIVE</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>REAL-TIME</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized metric components
export function CriticalMetrics({ className }: { className?: string }) {
  const criticalMetrics = [
    {
      label: 'High Priority',
      value: '89',
      change: { value: '+15.3%', type: 'increase' as const },
      variant: 'critical' as const,
      subtitle: 'Requires immediate attention'
    },
    {
      label: 'Overdue Cases',
      value: '23',
      change: { value: '+8.7%', type: 'increase' as const },
      variant: 'critical' as const,
      subtitle: 'Past deadline'
    },
    {
      label: 'System Alerts',
      value: '7',
      change: { value: '-12.5%', type: 'decrease' as const },
      variant: 'warning' as const,
      subtitle: 'Active warnings'
    }
  ]

  return (
    <MetricsOverview
      metrics={criticalMetrics}
      title="Critical Alerts"
      columns={3}
      className={className}
    />
  )
}

export function FinancialMetrics({ className }: { className?: string }) {
  const financialMetrics = [
    {
      label: 'Total Loss',
      value: '$847.2M',
      change: { value: '+23.1%', type: 'increase' as const },
      variant: 'critical' as const,
      subtitle: 'Estimated financial impact'
    },
    {
      label: 'Recovered',
      value: '$569.8M',
      change: { value: '+18.4%', type: 'increase' as const },
      variant: 'success' as const,
      subtitle: 'Assets recovered'
    },
    {
      label: 'Pending Recovery',
      value: '$277.4M',
      change: { value: '+31.2%', type: 'increase' as const },
      variant: 'warning' as const,
      subtitle: 'Under investigation'
    }
  ]

  return (
    <MetricsOverview
      metrics={financialMetrics}
      title="Financial Impact Analysis"
      columns={3}
      className={className}
    />
  )
}