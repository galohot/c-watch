// Dashboard Components Export
export { DashboardHeader } from './DashboardHeader'
export { MetricsOverview, CriticalMetrics, FinancialMetrics } from './MetricsOverview'

// Type exports for dashboard
export interface MetricData {
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