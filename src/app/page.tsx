'use client'

import { DashboardHeader, MetricsOverview, CriticalMetrics } from '../components/dashboard'
import { TerminalPanel, TickerTape, DataTable } from '../components/ui'
import { CorruptionChart, TrendChart } from '../components/charts'

// Sample data for demonstration
const sampleChartData = [
  { date: '2024-01-01', value: 45, severity: 'medium' as const },
  { date: '2024-01-02', value: 52, severity: 'high' as const },
  { date: '2024-01-03', value: 38, severity: 'low' as const },
  { date: '2024-01-04', value: 67, severity: 'critical' as const },
  { date: '2024-01-05', value: 41, severity: 'medium' as const },
]

const sampleTrendData = [
  { period: 'Q1', value: 234, trend: 'up' as const, percentage: 12.5 },
  { period: 'Q2', value: 189, trend: 'down' as const, percentage: -19.2 },
  { period: 'Q3', value: 267, trend: 'up' as const, percentage: 41.3 },
  { period: 'Q4', value: 298, trend: 'up' as const, percentage: 11.6 },
]

const sampleTableData = [
  { id: 'CC-2024-001', entity: 'Ministry of Health', amount: '$2.4M', status: 'Active', severity: 'High' },
  { id: 'CC-2024-002', entity: 'Public Works Dept', amount: '$890K', status: 'Under Review', severity: 'Medium' },
  { id: 'CC-2024-003', entity: 'Education Board', amount: '$1.2M', status: 'Resolved', severity: 'Low' },
  { id: 'CC-2024-004', entity: 'Transport Authority', amount: '$3.1M', status: 'Critical', severity: 'Critical' },
]

const tableColumns = [
  { key: 'id', header: 'Case ID', width: '120px' },
  { key: 'entity', header: 'Entity', width: '200px' },
  { key: 'amount', header: 'Amount', width: '100px', align: 'right' as const },
  { key: 'status', header: 'Status', width: '120px' },
  { key: 'severity', header: 'Severity', width: '100px' },
]

const tickerItems = [
  { id: '1', content: 'BREAKING: New corruption case identified in Infrastructure Ministry', color: 'red' as const },
  { id: '2', content: 'ALERT: $4.2M recovery operation completed successfully', color: 'green' as const },
  { id: '3', content: 'UPDATE: 23 cases resolved this quarter, 89% success rate', color: 'blue' as const },
  { id: '4', content: 'NOTICE: System maintenance scheduled for 02:00 UTC', color: 'yellow' as const },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-orange-400">
      <div className="max-w-[1920px] mx-auto">
        {/* Dashboard Header */}
        <DashboardHeader
          onSearch={(query) => console.log('Search:', query)}
          onRefresh={() => console.log('Refresh')}
          onExport={() => console.log('Export')}
          lastUpdated={new Date()}
        />

        {/* Ticker Tape */}
        <TickerTape items={tickerItems} className="border-b border-orange-400/20" />

        <div className="p-6 space-y-6">
          {/* Metrics Overview */}
          <MetricsOverview />

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TerminalPanel title="CORRUPTION TRENDS ANALYSIS">
              <CorruptionChart
                data={sampleChartData}
                type="area"
                width={600}
                height={300}
                title="Daily Case Reports"
                xAxisLabel="Date"
                yAxisLabel="Number of Cases"
              />
            </TerminalPanel>

            <TerminalPanel title="QUARTERLY PERFORMANCE">
              <TrendChart
                data={sampleTrendData}
                width={600}
                height={300}
                title="Case Resolution Trends"
                showTrendLine
                showPercentages
              />
            </TerminalPanel>
          </div>

          {/* Critical Alerts */}
          <CriticalMetrics />

          {/* Recent Cases Table */}
          <TerminalPanel title="RECENT CORRUPTION CASES">
            <DataTable
              columns={tableColumns}
              data={sampleTableData}
              onRowClick={(row) => console.log('Selected case:', row)}
              highlightRow={(row) => row.severity === 'Critical'}
            />
          </TerminalPanel>

          {/* Phase 2 Completion Status */}
          <TerminalPanel title="PHASE 2 IMPLEMENTATION STATUS" variant="highlighted">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-bold text-green-400">✓ Design System</h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  <li>• Bloomberg Terminal theme</li>
                  <li>• Color palette & typography</li>
                  <li>• Component styling</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-green-400">✓ UI Components</h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  <li>• TerminalWindow & Panel</li>
                  <li>• MetricCard & DataTable</li>
                  <li>• Buttons & Inputs</li>
                  <li>• Status Indicators</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-green-400">✓ Chart Components</h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  <li>• CorruptionChart (D3.js)</li>
                  <li>• TrendChart with animations</li>
                  <li>• Interactive tooltips</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-green-400">✓ Dashboard Layout</h4>
                <ul className="text-sm space-y-1 text-orange-400/70">
                  <li>• DashboardHeader</li>
                  <li>• MetricsOverview</li>
                  <li>• TickerTape</li>
                  <li>• Responsive grid</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-orange-400/20">
              <p className="text-center text-orange-400 font-bold">
                🎉 PHASE 2 COMPLETE - Bloomberg Terminal Design System Implemented
              </p>
              <p className="text-center text-orange-400/70 text-sm mt-2">
                Ready for Phase 3: Database Schema & Data Models
              </p>
            </div>
          </TerminalPanel>

          {/* System Footer */}
          <div className="border-t border-orange-400/30 pt-4 text-xs text-orange-400/50 font-mono">
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                <span>C-WATCH v1.0.0</span>
                <span>Phase 2 Complete</span>
                <span>Design System: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
