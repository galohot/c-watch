'use client'

import { useMemo } from 'react'
import { DashboardHeader, MetricsOverview, CriticalMetrics } from '../components/dashboard'
import { TerminalPanel, TickerTape, DataTable, LoadingSpinner } from '../components/ui'
import { CorruptionChart, TrendChart } from '../components/charts'
import { useCorruptionCases } from '../hooks/useCorruptionCases'
import { useMetrics } from '../hooks/useMetrics'
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates'

const tableColumns = [
  { key: 'id', header: 'Case ID', width: '120px' },
  { key: 'title', header: 'Title', width: '300px' },
  { key: 'estimated_losses_idr', header: 'Estimated Losses (IDR)', width: '150px', align: 'right' as const },
  { key: 'case_status', header: 'Status', width: '120px' },
  { key: 'corruption_severity_score', header: 'Severity', width: '100px' },
]

export default function Home() {
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCorruptionCases()
  const { metrics, loading: metricsLoading, error: metricsError, lastUpdated } = useMetrics()
  const { lastUpdate, updateCount, isConnected } = useRealtimeUpdates()

  // Process chart data from real corruption cases
  const chartData = useMemo(() => {
    if (!cases.length) return []
    
    // Group cases by date and calculate daily counts
    const dailyCounts = new Map<string, { count: number, totalSeverity: number, severityCount: number }>()
    
    cases.forEach(case_ => {
      const date = new Date(case_.created_at).toISOString().split('T')[0]
      const existing = dailyCounts.get(date) || { count: 0, totalSeverity: 0, severityCount: 0 }
      
      existing.count += 1
      if (case_.corruption_severity_score) {
        existing.totalSeverity += case_.corruption_severity_score
        existing.severityCount += 1
      }
      
      dailyCounts.set(date, existing)
    })
    
    return Array.from(dailyCounts.entries())
      .map(([date, data]) => {
        const avgSeverity = data.severityCount > 0 ? data.totalSeverity / data.severityCount : 5
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
        
        if (avgSeverity <= 3) severity = 'low'
        else if (avgSeverity <= 6) severity = 'medium'
        else if (avgSeverity <= 8) severity = 'high'
        else severity = 'critical'
        
        return {
          date,
          value: data.count,
          severity
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Last 30 days
  }, [cases])

  // Process trend data from metrics
  const trendData = useMemo(() => {
    if (!metrics) return []
    
    return [
      { period: 'Total Cases', value: metrics.totalCases, trend: 'up' as const, percentage: metrics.recentCasesGrowth },
      { period: 'This Month', value: metrics.casesThisMonth, trend: metrics.recentCasesGrowth > 0 ? 'up' as const : 'down' as const, percentage: Math.abs(metrics.recentCasesGrowth) },
      { period: 'Recovery Rate', value: Math.round(metrics.recoveryRate), trend: metrics.recoveryRate > 50 ? 'up' as const : 'down' as const, percentage: metrics.recoveryRate },
      { period: 'Avg Severity', value: Math.round(metrics.averageSeverityScore * 10) / 10, trend: metrics.averageSeverityScore < 5 ? 'down' as const : 'up' as const, percentage: metrics.averageSeverityScore * 10 },
    ]
  }, [metrics])

  // Process table data from real cases
  const tableData = useMemo(() => {
    return cases.slice(0, 10).map(case_ => ({
      id: case_.id.slice(0, 12) + '...',
      title: case_.title.length > 50 ? case_.title.slice(0, 50) + '...' : case_.title,
      estimated_losses_idr: case_.estimated_losses_idr 
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact' }).format(case_.estimated_losses_idr)
        : 'N/A',
      case_status: case_.case_status || 'Unknown',
      corruption_severity_score: case_.corruption_severity_score ? case_.corruption_severity_score.toFixed(1) : 'N/A'
    }))
  }, [cases])

  // Generate ticker items from real-time updates
  const tickerItems = useMemo(() => {
    const items = []
    
    if (isConnected) {
      items.push({
        id: 'connection',
        content: `SYSTEM: Real-time monitoring active - ${updateCount} updates received`,
        color: 'green' as const
      })
    } else {
      items.push({
        id: 'connection',
        content: 'SYSTEM: Connecting to real-time monitoring...',
        color: 'yellow' as const
      })
    }
    
    if (lastUpdate) {
      const updateType = lastUpdate.case_status?.toLowerCase().includes('new') ? 'NEW CASE' : 'UPDATE'
      items.push({
        id: 'latest',
        content: `${updateType}: ${lastUpdate.title.slice(0, 80)}...`,
        color: 'red' as const
      })
    }
    
    if (metrics) {
      items.push({
        id: 'stats',
        content: `STATS: ${metrics.totalCases} total cases, ${metrics.casesThisMonth} this month, ${metrics.recoveryRate.toFixed(1)}% recovery rate`,
        color: 'blue' as const
      })
    }
    
    return items
  }, [isConnected, updateCount, lastUpdate, metrics])

  const handleRefresh = () => {
    refetchCases()
  }

  return (
    <main className="min-h-screen bg-black text-orange-400">
      <div className="max-w-[1920px] mx-auto">
        {/* Dashboard Header */}
        <DashboardHeader
          onSearch={(query) => console.log('Search:', query)}
          onRefresh={handleRefresh}
          onExport={() => console.log('Export')}
          lastUpdated={lastUpdated || undefined}
          loading={casesLoading || metricsLoading}
        />

        {/* Ticker Tape */}
        <TickerTape items={tickerItems} className="border-b border-orange-400/20" />

        <div className="p-6 space-y-6">
          {/* Metrics Overview */}
          <MetricsOverview />

          {/* Loading State */}
          {(casesLoading || metricsLoading) && (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-orange-400">Loading corruption data...</span>
            </div>
          )}

          {/* Error State */}
          {casesError && (
            <div className="p-4 bg-red-900/20 border border-red-400/30 rounded">
              <div className="text-red-400">Error loading data: {casesError}</div>
              <button 
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Charts Section */}
          {!casesLoading && !metricsLoading && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TerminalPanel title="CORRUPTION TRENDS ANALYSIS">
                <CorruptionChart
                  data={chartData}
                  type="area"
                  width={600}
                  height={300}
                  title="Daily Case Reports"
                  xAxisLabel="Date"
                  yAxisLabel="Number of Cases"
                  loading={casesLoading}
                  error={casesError || undefined}
                />
              </TerminalPanel>

              <TerminalPanel title="KEY METRICS TRENDS">
                <TrendChart
                  data={trendData}
                  width={600}
                  height={300}
                  title="Performance Indicators"
                  showTrendLine
                  showPercentages
                  loading={metricsLoading}
                  error={metricsError || undefined}
                />
              </TerminalPanel>
            </div>
          )}

          {/* Critical Alerts */}
          <CriticalMetrics />

          {/* Recent Cases Table */}
          <TerminalPanel title={`RECENT CORRUPTION CASES (${cases.length} total)`}>
            <DataTable
              columns={tableColumns}
              data={tableData}
              onRowClick={(row) => console.log('Selected case:', row)}
              highlightRow={(row) => parseFloat(row.corruption_severity_score) > 8}
              loading={casesLoading}
            />
          </TerminalPanel>

          {/* System Status Panel */}
          <TerminalPanel title="SYSTEM STATUS & REAL-TIME MONITORING" variant="highlighted">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-bold text-green-400">✓ Database Connection</h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  <li>• Supabase: Connected</li>
                  <li>• Total cases: {cases.length}</li>
                  <li>• Last sync: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? '✓' : '✗'} Real-time Updates
                </h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  <li>• Status: {isConnected ? 'Active' : 'Disconnected'}</li>
                  <li>• Updates received: {updateCount}</li>
                  <li>• Last update: {lastUpdate ? new Date(lastUpdate.created_at).toLocaleTimeString() : 'None'}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-green-400">✓ Data Processing</h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  {metrics && (
                    <>
                      <li>• Cases this month: {metrics.casesThisMonth}</li>
                      <li>• Recovery rate: {metrics.recoveryRate.toFixed(1)}%</li>
                      <li>• Avg severity: {metrics.averageSeverityScore.toFixed(1)}/10</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-green-400">✓ Chart Data</h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  <li>• Timeline points: {chartData.length}</li>
                  <li>• Trend metrics: {trendData.length}</li>
                  <li>• Table rows: {tableData.length}</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-orange-400/20">
              <p className="text-center text-orange-400 font-bold">
                🎉 REAL-TIME CORRUPTION MONITORING SYSTEM ACTIVE
              </p>
              <p className="text-center text-orange-400/70 text-sm mt-2">
                Live data from Supabase • Real-time updates • Interactive dashboard
              </p>
            </div>
          </TerminalPanel>

          {/* System Footer */}
          <div className="border-t border-orange-400/30 pt-4 text-xs text-orange-400/50 font-mono">
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                <span>C-WATCH v1.0.0</span>
                <span>Supabase Integration: Active</span>
                <span>Real-time Monitoring: {isConnected ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{isConnected ? 'All Systems Operational' : 'Connection Issues Detected'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
