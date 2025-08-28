'use client'

import { useMemo, useState } from 'react'

import { DashboardHeader, MetricsOverview, CriticalMetrics } from '../components/dashboard'
import { TickerTape, DataTable, LoadingSpinner } from '../components/ui'
import { CorruptionChart, ChoroplethMap, BarChart, NetworkGraph, Treemap } from '../components/charts'

import { useCorruptionCases } from '../hooks/useCorruptionCases'
import { useMetrics } from '../hooks/useMetrics'
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates'
import { useRegionalStats } from '../hooks/useRegionalStats'
import { useSectorStats } from '../hooks/useSectorStats'

const tableColumns = [
  { key: 'id', header: 'Case ID', width: '120px' },
  { key: 'title', header: 'Title', width: '300px' },
  { key: 'estimated_losses_idr', header: 'Estimated Losses (IDR)', width: '150px', align: 'right' as const },
  { key: 'case_status', header: 'Status', width: '120px' },
  { key: 'corruption_severity_score', header: 'Severity', width: '100px' },
]

export default function Home() {
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCorruptionCases()
  const { metrics, loading: metricsLoading, lastUpdated } = useMetrics()
  const { lastUpdate, updateCount, isConnected } = useRealtimeUpdates()
  const { stats: regionalStats, loading: regionalLoading } = useRegionalStats()
  const { stats: sectorStats, loading: sectorLoading } = useSectorStats()
  
  // State for geographic visualization
  const [selectedProvinces] = useState<string[]>([])
  const [showRegionalOverlay, setShowRegionalOverlay] = useState(false)

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

  // Process regional data for choropleth map
  const mapData = useMemo(() => {
    if (!regionalStats.length) return []
    
    return regionalStats.map(stat => {
      const intensity = stat.averageSeverityScore / 10 // Normalize to 0-1 scale
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
      
      if (stat.averageSeverityScore <= 3) severity = 'low'
      else if (stat.averageSeverityScore <= 6) severity = 'medium'
      else if (stat.averageSeverityScore <= 8) severity = 'high'
      else severity = 'critical'
      
      return {
        provinceId: stat.region.toLowerCase().replace(/\s+/g, '_'),
        provinceName: stat.region,
        corruptionIntensity: intensity,
        caseCount: stat.caseCount,
        severity,
        metadata: {
          totalLossesIdr: stat.totalLossesIdr,
          recoveredAssetsIdr: stat.recoveredAssetsIdr,
          averageSeverityScore: stat.averageSeverityScore
        }
      }
    })
  }, [regionalStats])

  // Calculate overlay statistics for selected provinces
  const overlayStats = useMemo(() => {
    if (!selectedProvinces.length || !regionalStats.length) return null
    
    const selectedStats = regionalStats.filter(stat => 
      selectedProvinces.includes(stat.region.toLowerCase().replace(/\s+/g, '_'))
    )
    
    if (!selectedStats.length) return null
    
    const totalCases = selectedStats.reduce((sum, stat) => sum + stat.caseCount, 0)
    const totalLosses = selectedStats.reduce((sum, stat) => sum + stat.totalLossesIdr, 0)
    const totalRecovered = selectedStats.reduce((sum, stat) => sum + stat.recoveredAssetsIdr, 0)
    const avgSeverity = selectedStats.reduce((sum, stat) => sum + stat.averageSeverityScore, 0) / selectedStats.length
    const recoveryRate = totalLosses > 0 ? (totalRecovered / totalLosses) * 100 : 0
    
    return {
      regions: selectedStats.length,
      totalCases,
      totalLosses,
      totalRecovered,
      avgSeverity,
      recoveryRate,
      regionNames: selectedStats.map(s => s.region)
    }
  }, [selectedProvinces, regionalStats])



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
        content: `SYSTEM: Real-time monitoring active - ${updateCount || 0} updates received`,
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
        content: `${updateType}: ${lastUpdate.title?.slice(0, 80) || 'Untitled case'}...`,
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
          {(casesLoading || metricsLoading || regionalLoading) && (
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

          {/* Responsive Dashboard Grid */}
          {!casesLoading && !metricsLoading && !regionalLoading && (
            <div className="dashboard-grid">
              {/* Top Row - Primary Charts */}
              <div className="dashboard-section dashboard-section-primary">
                <div className="terminal-grid-2">
                  <div className="terminal-panel h-full">
                    <div className="terminal-panel-header">
                      <h3 className="terminal-panel-title">CORRUPTION TRENDS ANALYSIS</h3>
                      <div className="terminal-panel-indicator pulse-glow"></div>
                    </div>
                    <div className="terminal-panel-content">
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
                    </div>
                  </div>
                  
                  <div className="terminal-panel h-full relative">
                    <div className="terminal-panel-header">
                      <h3 className="terminal-panel-title">GEOGRAPHIC VISUALIZATION</h3>
                      <div className="terminal-panel-indicator pulse-glow"></div>
                    </div>
                    <div className="terminal-panel-content">
                      <ChoroplethMap
                        data={mapData}
                        interactive={true}
                        showTooltip={true}
                        valueFormat={(value) => (value * 10).toFixed(1)}
                      />
                      
                      {/* Regional Statistics Overlay */}
                      {showRegionalOverlay && overlayStats && (
                        <div className="terminal-overlay">
                          <div className="terminal-overlay-header">
                            <h4 className="terminal-overlay-title">Regional Statistics</h4>
                            <button 
                              onClick={() => setShowRegionalOverlay(false)}
                              className="terminal-button-close"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="terminal-overlay-content">
                            <div className="terminal-overlay-section">
                              <p className="text-terminal-amber font-semibold">
                                {overlayStats.regions} Region{overlayStats.regions !== 1 ? 's' : ''} Selected
                              </p>
                              <p className="text-xs text-terminal-gray">
                                {overlayStats.regionNames.join(', ')}
                              </p>
                            </div>
                            
                            <div className="terminal-grid">
                              <div className="terminal-stat">
                                <p className="terminal-stat-label">Total Cases</p>
                                <p className="terminal-stat-value">{overlayStats.totalCases.toLocaleString()}</p>
                              </div>
                              <div className="terminal-stat">
                                <p className="terminal-stat-label">Avg Severity</p>
                                <p className="terminal-stat-value">{overlayStats.avgSeverity.toFixed(1)}/10</p>
                              </div>
                              <div className="terminal-stat">
                                <p className="terminal-stat-label">Total Losses</p>
                                <p className="terminal-stat-value">
                                  {new Intl.NumberFormat('id-ID', { 
                                    style: 'currency', 
                                    currency: 'IDR', 
                                    notation: 'compact' 
                                  }).format(overlayStats.totalLosses)}
                                </p>
                              </div>
                              <div className="terminal-stat">
                                <p className="terminal-stat-label">Recovery Rate</p>
                                <p className="terminal-stat-value">{overlayStats.recoveryRate.toFixed(1)}%</p>
                              </div>
                            </div>
                            
                            <div className="terminal-overlay-section border-t border-terminal-border-color pt-3">
                              <p className="terminal-stat-label">Recovered Assets</p>
                              <p className="terminal-stat-value">
                                {new Intl.NumberFormat('id-ID', { 
                                  style: 'currency', 
                                  currency: 'IDR', 
                                  notation: 'compact' 
                                }).format(overlayStats.totalRecovered)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Middle Row - Sector Analysis (Full Width) */}
              <div className="dashboard-section dashboard-section-secondary">
                <div className="terminal-panel h-full">
                  <div className="terminal-panel-header">
                    <h3 className="terminal-panel-title">SECTOR ANALYSIS</h3>
                    <div className="terminal-panel-indicator glow-blue"></div>
                  </div>
                  <div className="terminal-panel-content">
                    <BarChart
                      data={sectorStats.map(stat => ({
                        label: stat.sector,
                        value: stat.caseCount,
                        color: stat.averageSeverityScore > 7 ? '#ef4444' : stat.averageSeverityScore > 5 ? '#f97316' : '#10b981'
                      }))}
                      className="w-full h-full"
                      loading={sectorLoading}
                    />
                  </div>
                </div>
              </div>
              
              {/* Institution Network Row */}
              <div className="dashboard-section dashboard-section-secondary">
                <div className="terminal-grid-2">
                  <div className="terminal-panel h-full">
                    <div className="terminal-panel-header">
                      <h3 className="terminal-panel-title">INSTITUTION NETWORK</h3>
                      <div className="terminal-panel-indicator glow-green"></div>
                    </div>
                    <div className="terminal-panel-content">
                      <NetworkGraph
                        width={400}
                        height={300}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  
                  <div className="terminal-panel h-full">
                    <div className="terminal-panel-header">
                      <h3 className="terminal-panel-title">HIERARCHICAL ANALYSIS</h3>
                      <div className="terminal-panel-indicator glow-red"></div>
                    </div>
                    <div className="terminal-panel-content">
                      <Treemap
                        width={400}
                        height={300}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Row - Critical Alerts and Live Case Feed */}
              <div className="dashboard-section dashboard-section-tertiary">
                <div className="terminal-grid-2">
                  <div className="terminal-panel h-full">
                    <CriticalMetrics />
                  </div>
                  
                  <div className="terminal-panel h-full">
                    <div className="terminal-panel-header">
                      <h3 className="terminal-panel-title">RECENT CORRUPTION CASES ({cases.length} total)</h3>
                      <div className="terminal-panel-indicator animated-border"></div>
                    </div>
                    <div className="terminal-panel-content">
                      <DataTable
                        columns={tableColumns}
                        data={tableData}
                        onRowClick={(row) => console.log('Selected case:', row)}
                        highlightRow={(row) => parseFloat(row.corruption_severity_score) > 8}
                        loading={casesLoading}
                        expandable={true}
                        expandedRowKey="id"
                        renderExpandedRow={(row) => {
                          const originalCase = cases.find(c => c.id.startsWith(row.id.replace('...', '')))
                          if (!originalCase) return <div className="text-orange-400/70">Case details not available</div>
                          
                          return (
                            <div className="space-y-4 text-sm">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-orange-400 border-b border-orange-400/30 pb-1">Case Information</h4>
                                  <div className="space-y-1 text-orange-400/80">
                                    <p><span className="text-orange-400">Full ID:</span> {originalCase.id}</p>
                                    <p><span className="text-orange-400">Title:</span> {originalCase.title}</p>
                                    <p><span className="text-orange-400">Status:</span> <span className={`px-2 py-1 rounded text-xs ${
                                      originalCase.case_status?.toLowerCase().includes('closed') ? 'bg-green-900/30 text-green-400' :
                                      originalCase.case_status?.toLowerCase().includes('ongoing') ? 'bg-yellow-900/30 text-yellow-400' :
                                      'bg-red-900/30 text-red-400'
                                    }`}>{originalCase.case_status || 'Unknown'}</span></p>
                                    <p><span className="text-orange-400">Created:</span> {new Date(originalCase.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-bold text-orange-400 border-b border-orange-400/30 pb-1">Financial Impact</h4>
                                  <div className="space-y-1 text-orange-400/80">
                                    <p><span className="text-orange-400">Estimated Losses:</span> {originalCase.estimated_losses_idr ? 
                                      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(originalCase.estimated_losses_idr) : 'Not specified'}</p>
                                    <p><span className="text-orange-400">Severity Score:</span> <span className={`px-2 py-1 rounded text-xs ${
                                      (originalCase.corruption_severity_score || 0) >= 8 ? 'bg-red-900/30 text-red-400' :
                                      (originalCase.corruption_severity_score || 0) >= 6 ? 'bg-yellow-900/30 text-yellow-400' :
                                      'bg-green-900/30 text-green-400'
                                    }`}>{originalCase.corruption_severity_score ? `${originalCase.corruption_severity_score.toFixed(1)}/10` : 'N/A'}</span></p>
                                  </div>
                                </div>
                              </div>
                              {originalCase.excerpt && (
                                <div className="space-y-2">
                                  <h4 className="font-bold text-orange-400 border-b border-orange-400/30 pb-1">Case Summary</h4>
                                  <p className="text-orange-400/80 leading-relaxed">{originalCase.excerpt}</p>
                                </div>
                              )}
                              <div className="flex justify-end pt-2 border-t border-orange-400/20">
                                <button 
                                  onClick={() => console.log('View full case details:', originalCase.id)}
                                  className="px-3 py-1 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-400/40 rounded text-xs text-orange-400 transition-colors"
                                >
                                  View Full Details
                                </button>
                              </div>
                            </div>
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}





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
