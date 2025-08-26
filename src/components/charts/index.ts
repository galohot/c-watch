// Chart Components Export
export { CorruptionChart } from './CorruptionChart'
export { TrendChart } from './TrendChart'
export { ChoroplethMap } from './ChoroplethMap'
export { default as BarChart } from './BarChart'
export { default as NetworkGraph } from './NetworkGraph'
export { default as Treemap } from './Treemap'

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