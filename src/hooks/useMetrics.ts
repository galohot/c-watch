'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'

export interface DashboardMetrics {
  totalCases: number
  totalLossesIdr: number
  totalRecoveredIdr: number
  recoveryRate: number
  averageSeverityScore: number
  casesThisMonth: number
  casesThisYear: number
  topCorruptionType: string | null
  topSector: string | null
  topRegion: string | null
  pendingCases: number
  closedCases: number
  ongoingCases: number
  highSeverityCases: number // severity score > 7
  recentCasesGrowth: number // percentage change from last month
}

export interface UseMetricsResult {
  metrics: DashboardMetrics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

export function useMetrics(): UseMetricsResult {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      
      // Get all cases for comprehensive analysis
      const { data: cases, error: supabaseError } = await supabase
        .from('corruption_cases')
        .select('*')

      if (supabaseError) {
        throw supabaseError
      }

      if (!cases || cases.length === 0) {
        setMetrics({
          totalCases: 0,
          totalLossesIdr: 0,
          totalRecoveredIdr: 0,
          recoveryRate: 0,
          averageSeverityScore: 0,
          casesThisMonth: 0,
          casesThisYear: 0,
          topCorruptionType: null,
          topSector: null,
          topRegion: null,
          pendingCases: 0,
          closedCases: 0,
          ongoingCases: 0,
          highSeverityCases: 0,
          recentCasesGrowth: 0
        })
        return
      }

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      // Calculate basic metrics
      const totalCases = cases.length
      const totalLossesIdr = cases.reduce((sum, case_) => sum + (case_.estimated_losses_idr || 0), 0)
      const totalRecoveredIdr = cases.reduce((sum, case_) => sum + (case_.asset_recovery_idr || 0), 0)
      const recoveryRate = totalLossesIdr > 0 ? (totalRecoveredIdr / totalLossesIdr) * 100 : 0

      // Calculate average severity score
      const severityScores = cases
        .map(case_ => case_.corruption_severity_score)
        .filter((score): score is number => score !== null)
      const averageSeverityScore = severityScores.length > 0 
        ? severityScores.reduce((sum, score) => sum + score, 0) / severityScores.length 
        : 0

      // Time-based metrics
      const casesThisMonth = cases.filter(case_ => {
        const createdDate = new Date(case_.created_at)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      }).length

      const casesThisYear = cases.filter(case_ => {
        const createdDate = new Date(case_.created_at)
        return createdDate.getFullYear() === currentYear
      }).length

      const casesLastMonth = cases.filter(case_ => {
        const createdDate = new Date(case_.created_at)
        return createdDate.getMonth() === lastMonth && createdDate.getFullYear() === lastMonthYear
      }).length

      const recentCasesGrowth = casesLastMonth > 0 
        ? ((casesThisMonth - casesLastMonth) / casesLastMonth) * 100 
        : casesThisMonth > 0 ? 100 : 0

      // Status-based metrics
      const pendingCases = cases.filter(case_ => 
        case_.case_status?.toLowerCase().includes('pending') || 
        case_.case_status?.toLowerCase().includes('investigation')
      ).length

      const closedCases = cases.filter(case_ => 
        case_.case_status?.toLowerCase().includes('closed') || 
        case_.case_status?.toLowerCase().includes('completed')
      ).length

      const ongoingCases = totalCases - pendingCases - closedCases

      const highSeverityCases = cases.filter(case_ => 
        case_.corruption_severity_score && case_.corruption_severity_score > 7
      ).length

      // Find top categories
      const corruptionTypeCount = new Map<string, number>()
      const sectorCount = new Map<string, number>()
      const regionCount = new Map<string, number>()

      cases.forEach(case_ => {
        // Count corruption types
        if (case_.corruption_type && Array.isArray(case_.corruption_type)) {
          case_.corruption_type.forEach((type: string) => {
            corruptionTypeCount.set(type, (corruptionTypeCount.get(type) || 0) + 1)
          })
        }

        // Count sectors
        if (case_.sector) {
          sectorCount.set(case_.sector, (sectorCount.get(case_.sector) || 0) + 1)
        }

        // Count regions
        if (case_.regions_affected && Array.isArray(case_.regions_affected)) {
          case_.regions_affected.forEach((region: string) => {
            regionCount.set(region, (regionCount.get(region) || 0) + 1)
          })
        }
      })

      const topCorruptionType = corruptionTypeCount.size > 0 
        ? Array.from(corruptionTypeCount.entries()).sort((a, b) => b[1] - a[1])[0][0] 
        : null

      const topSector = sectorCount.size > 0 
        ? Array.from(sectorCount.entries()).sort((a, b) => b[1] - a[1])[0][0] 
        : null

      const topRegion = regionCount.size > 0 
        ? Array.from(regionCount.entries()).sort((a, b) => b[1] - a[1])[0][0] 
        : null

      const dashboardMetrics: DashboardMetrics = {
        totalCases,
        totalLossesIdr,
        totalRecoveredIdr,
        recoveryRate,
        averageSeverityScore,
        casesThisMonth,
        casesThisYear,
        topCorruptionType,
        topSector,
        topRegion,
        pendingCases,
        closedCases,
        ongoingCases,
        highSeverityCases,
        recentCasesGrowth
      }

      setMetrics(dashboardMetrics)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
    lastUpdated
  }
}