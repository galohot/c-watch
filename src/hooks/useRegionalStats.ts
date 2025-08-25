'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface RegionalStat {
  region: string
  caseCount: number
  totalLossesIdr: number
  averageSeverityScore: number
  recoveredAssetsIdr: number
}

export interface UseRegionalStatsResult {
  stats: RegionalStat[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalRegions: number
}

export function useRegionalStats(): UseRegionalStatsResult {
  const [stats, setStats] = useState<RegionalStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRegionalStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all cases with regional data
      const { data: cases, error: supabaseError } = await supabase
        .from('corruption_cases')
        .select(`
          regions_affected,
          estimated_losses_idr,
          asset_recovery_idr,
          corruption_severity_score
        `)
        .not('regions_affected', 'is', null)

      if (supabaseError) {
        throw supabaseError
      }

      // Process and aggregate data by region
      const regionMap = new Map<string, {
        caseCount: number
        totalLosses: number
        totalRecovered: number
        severityScores: number[]
      }>()

      cases?.forEach(case_ => {
        if (case_.regions_affected && Array.isArray(case_.regions_affected)) {
          case_.regions_affected.forEach((region: string) => {
            const existing = regionMap.get(region) || {
              caseCount: 0,
              totalLosses: 0,
              totalRecovered: 0,
              severityScores: []
            }

            existing.caseCount += 1
            existing.totalLosses += case_.estimated_losses_idr || 0
            existing.totalRecovered += case_.asset_recovery_idr || 0
            
            if (case_.corruption_severity_score !== null) {
              existing.severityScores.push(case_.corruption_severity_score)
            }

            regionMap.set(region, existing)
          })
        }
      })

      // Convert to final format
      const regionalStats: RegionalStat[] = Array.from(regionMap.entries())
        .map(([region, data]) => ({
          region,
          caseCount: data.caseCount,
          totalLossesIdr: data.totalLosses,
          averageSeverityScore: data.severityScores.length > 0 
            ? data.severityScores.reduce((sum, score) => sum + score, 0) / data.severityScores.length
            : 0,
          recoveredAssetsIdr: data.totalRecovered
        }))
        .sort((a, b) => b.caseCount - a.caseCount) // Sort by case count descending

      setStats(regionalStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegionalStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchRegionalStats,
    totalRegions: stats.length
  }
}