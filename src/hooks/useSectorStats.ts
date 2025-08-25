'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface SectorStat {
  sector: string
  caseCount: number
  totalLossesIdr: number
  averageSeverityScore: number
  recoveredAssetsIdr: number
  recoveryRate: number // Percentage of recovered vs lost
  governmentLevels: string[]
  commonCorruptionTypes: string[]
}

export interface UseSectorStatsResult {
  stats: SectorStat[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalSectors: number
  topSectorByLosses: SectorStat | null
  topSectorByCases: SectorStat | null
}

export function useSectorStats(): UseSectorStatsResult {
  const [stats, setStats] = useState<SectorStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSectorStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all cases with sector data
      const { data: cases, error: supabaseError } = await supabase
        .from('corruption_cases')
        .select(`
          sector,
          estimated_losses_idr,
          asset_recovery_idr,
          corruption_severity_score,
          government_level,
          corruption_type
        `)
        .not('sector', 'is', null)

      if (supabaseError) {
        throw supabaseError
      }

      // Process and aggregate data by sector
      const sectorMap = new Map<string, {
        caseCount: number
        totalLosses: number
        totalRecovered: number
        severityScores: number[]
        governmentLevels: Set<string>
        corruptionTypes: Set<string>
      }>()

      cases?.forEach(case_ => {
        if (case_.sector) {
          const existing = sectorMap.get(case_.sector) || {
            caseCount: 0,
            totalLosses: 0,
            totalRecovered: 0,
            severityScores: [],
            governmentLevels: new Set<string>(),
            corruptionTypes: new Set<string>()
          }

          existing.caseCount += 1
          existing.totalLosses += case_.estimated_losses_idr || 0
          existing.totalRecovered += case_.asset_recovery_idr || 0
          
          if (case_.corruption_severity_score !== null) {
            existing.severityScores.push(case_.corruption_severity_score)
          }

          if (case_.government_level) {
            existing.governmentLevels.add(case_.government_level)
          }

          if (case_.corruption_type && Array.isArray(case_.corruption_type)) {
            case_.corruption_type.forEach((type: string) => {
              existing.corruptionTypes.add(type)
            })
          }

          sectorMap.set(case_.sector, existing)
        }
      })

      // Convert to final format
      const sectorStats: SectorStat[] = Array.from(sectorMap.entries())
        .map(([sector, data]) => {
          const recoveryRate = data.totalLosses > 0 
            ? (data.totalRecovered / data.totalLosses) * 100 
            : 0

          return {
            sector,
            caseCount: data.caseCount,
            totalLossesIdr: data.totalLosses,
            averageSeverityScore: data.severityScores.length > 0 
              ? data.severityScores.reduce((sum, score) => sum + score, 0) / data.severityScores.length
              : 0,
            recoveredAssetsIdr: data.totalRecovered,
            recoveryRate,
            governmentLevels: Array.from(data.governmentLevels),
            commonCorruptionTypes: Array.from(data.corruptionTypes)
          }
        })
        .sort((a, b) => b.totalLossesIdr - a.totalLossesIdr) // Sort by total losses descending

      setStats(sectorStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSectorStats()
  }, [])

  const topSectorByLosses = stats.length > 0 ? stats[0] : null
  const topSectorByCases = stats.length > 0 
    ? [...stats].sort((a, b) => b.caseCount - a.caseCount)[0] 
    : null

  return {
    stats,
    loading,
    error,
    refetch: fetchSectorStats,
    totalSectors: stats.length,
    topSectorByLosses,
    topSectorByCases
  }
}