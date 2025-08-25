// Chart Components Export
export { CorruptionChart } from './CorruptionChart'
export { TrendChart } from './TrendChart'

// Type exports for charts
export interface ChartData {
  date: string
  value: number
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface TrendData {
  period: string
  value: number
  trend: 'up' | 'down' | 'stable'
  percentage?: number
}