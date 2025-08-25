import { CorruptionCase } from './supabase'

// Regional data aggregation interface
export interface RegionalData {
  region: string
  totalCases: number
  totalLossesIdr: number
  averageSeverityScore: number
  casesByStatus: Record<string, number>
  casesByType: Record<string, number>
}

// Time series data interface
export interface TimeSeriesData {
  date: string
  count: number
  totalLossesIdr: number
  averageSeverityScore: number
}

// Severity score calculation weights
const SEVERITY_WEIGHTS = {
  estimatedLosses: 0.4,
  governmentLevel: 0.3,
  corruptionType: 0.2,
  caseStatus: 0.1
} as const

// Government level severity mapping
const GOVERNMENT_LEVEL_SCORES = {
  'national': 10,
  'provincial': 8,
  'regency': 6,
  'city': 6,
  'district': 4,
  'village': 2
} as const

// Corruption type severity mapping
const CORRUPTION_TYPE_SCORES = {
  'embezzlement': 9,
  'bribery': 8,
  'fraud': 7,
  'extortion': 8,
  'abuse_of_power': 6,
  'nepotism': 5,
  'conflict_of_interest': 4
} as const

// Case status severity mapping
const CASE_STATUS_SCORES = {
  'convicted': 10,
  'trial': 8,
  'investigation': 6,
  'reported': 4,
  'dismissed': 2
} as const

/**
 * Aggregate corruption cases data by region
 * @param cases Array of corruption cases
 * @returns Array of regional aggregated data
 */
export function aggregateRegionalData(cases: CorruptionCase[]): RegionalData[] {
  const regionalMap = new Map<string, RegionalData>()

  cases.forEach(case_ => {
    const regions = case_.regions_affected || ['Unknown']
    
    regions.forEach(region => {
      if (!regionalMap.has(region)) {
        regionalMap.set(region, {
          region,
          totalCases: 0,
          totalLossesIdr: 0,
          averageSeverityScore: 0,
          casesByStatus: {},
          casesByType: {}
        })
      }

      const data = regionalMap.get(region)!
      data.totalCases += 1
      data.totalLossesIdr += case_.estimated_losses_idr || 0

      // Aggregate by status
      const status = case_.case_status || 'unknown'
      data.casesByStatus[status] = (data.casesByStatus[status] || 0) + 1

      // Aggregate by corruption type
      const types = case_.corruption_type || ['unknown']
      types.forEach(type => {
        data.casesByType[type] = (data.casesByType[type] || 0) + 1
      })
    })
  })

  // Calculate average severity scores
  const result = Array.from(regionalMap.values())
  result.forEach(data => {
    const regionCases = cases.filter(case_ => 
      case_.regions_affected?.includes(data.region)
    )
    const totalScore = regionCases.reduce((sum, case_) => 
      sum + (case_.corruption_severity_score || 0), 0
    )
    data.averageSeverityScore = regionCases.length > 0 ? totalScore / regionCases.length : 0
  })

  return result.sort((a, b) => b.totalCases - a.totalCases)
}

/**
 * Calculate corruption severity score for a case
 * @param case_ Corruption case data
 * @returns Calculated severity score (0-10)
 */
export function calculateSeverityScores(case_: CorruptionCase): number {
  let score = 0

  // Estimated losses component (0-10 scale)
  if (case_.estimated_losses_idr) {
    const lossesScore = Math.min(10, Math.log10(case_.estimated_losses_idr / 1000000) * 2)
    score += lossesScore * SEVERITY_WEIGHTS.estimatedLosses
  }

  // Government level component
  const govLevel = case_.government_level?.toLowerCase()
  if (govLevel && govLevel in GOVERNMENT_LEVEL_SCORES) {
    const govScore = GOVERNMENT_LEVEL_SCORES[govLevel as keyof typeof GOVERNMENT_LEVEL_SCORES]
    score += govScore * SEVERITY_WEIGHTS.governmentLevel
  }

  // Corruption type component (use highest severity type)
  if (case_.corruption_type && case_.corruption_type.length > 0) {
    const typeScores = case_.corruption_type.map(type => 
      CORRUPTION_TYPE_SCORES[type as keyof typeof CORRUPTION_TYPE_SCORES] || 5
    )
    const maxTypeScore = Math.max(...typeScores)
    score += maxTypeScore * SEVERITY_WEIGHTS.corruptionType
  }

  // Case status component
  const status = case_.case_status?.toLowerCase()
  if (status && status in CASE_STATUS_SCORES) {
    const statusScore = CASE_STATUS_SCORES[status as keyof typeof CASE_STATUS_SCORES]
    score += statusScore * SEVERITY_WEIGHTS.caseStatus
  }

  return Math.min(10, Math.max(0, score))
}

/**
 * Format Indonesian Rupiah currency
 * @param amount Amount in IDR
 * @param compact Whether to use compact notation (e.g., 1.2M)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact && amount >= 1000000) {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1
    })
    return formatter.format(amount)
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Process time series data for corruption cases
 * @param cases Array of corruption cases
 * @param dateField Field to use for time grouping ('published_date', 'incident_start_date', 'created_at')
 * @param interval Time interval ('day', 'week', 'month', 'year')
 * @returns Array of time series data points
 */
export function processTimeSeriesData(
  cases: CorruptionCase[],
  dateField: 'published_date' | 'incident_start_date' | 'created_at' = 'published_date',
  interval: 'day' | 'week' | 'month' | 'year' = 'month'
): TimeSeriesData[] {
  const timeMap = new Map<string, {
    count: number
    totalLossesIdr: number
    severityScores: number[]
  }>()

  cases.forEach(case_ => {
    const dateValue = case_[dateField]
    if (!dateValue) return

    const date = new Date(dateValue)
    let timeKey: string

    switch (interval) {
      case 'day':
        timeKey = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        timeKey = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        timeKey = String(date.getFullYear())
        break
      default:
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!timeMap.has(timeKey)) {
      timeMap.set(timeKey, {
        count: 0,
        totalLossesIdr: 0,
        severityScores: []
      })
    }

    const data = timeMap.get(timeKey)!
    data.count += 1
    data.totalLossesIdr += case_.estimated_losses_idr || 0
    if (case_.corruption_severity_score) {
      data.severityScores.push(case_.corruption_severity_score)
    }
  })

  // Convert to array and calculate averages
  const result: TimeSeriesData[] = Array.from(timeMap.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    totalLossesIdr: data.totalLossesIdr,
    averageSeverityScore: data.severityScores.length > 0 
      ? data.severityScores.reduce((sum, score) => sum + score, 0) / data.severityScores.length
      : 0
  }))

  // Sort by date
  return result.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Filter corruption cases by status
 * @param cases Array of corruption cases
 * @param statuses Array of status values to filter by
 * @param exclude Whether to exclude the specified statuses (default: false)
 * @returns Filtered array of corruption cases
 */
export function filterCasesByStatus(
  cases: CorruptionCase[],
  statuses: string[],
  exclude: boolean = false
): CorruptionCase[] {
  const statusSet = new Set(statuses.map(s => s.toLowerCase()))
  
  return cases.filter(case_ => {
    const caseStatus = case_.case_status?.toLowerCase() || 'unknown'
    const hasStatus = statusSet.has(caseStatus)
    return exclude ? !hasStatus : hasStatus
  })
}

/**
 * Get unique values from a specific field across all cases
 * @param cases Array of corruption cases
 * @param field Field name to extract unique values from
 * @returns Array of unique values
 */
export function getUniqueFieldValues(
  cases: CorruptionCase[],
  field: keyof CorruptionCase
): string[] {
  const values = new Set<string>()
  
  cases.forEach(case_ => {
    const value = case_[field]
    if (Array.isArray(value)) {
      value.forEach(v => values.add(String(v)))
    } else if (value !== null && value !== undefined) {
      values.add(String(value))
    }
  })
  
  return Array.from(values).sort()
}

/**
 * Calculate statistics for a set of corruption cases
 * @param cases Array of corruption cases
 * @returns Statistical summary
 */
export function calculateCaseStatistics(cases: CorruptionCase[]) {
  const totalCases = cases.length
  const totalLosses = cases.reduce((sum, case_) => sum + (case_.estimated_losses_idr || 0), 0)
  const totalRecovery = cases.reduce((sum, case_) => sum + (case_.asset_recovery_idr || 0), 0)
  
  const severityScores = cases
    .map(case_ => case_.corruption_severity_score)
    .filter((score): score is number => score !== null && score !== undefined)
  
  const averageSeverity = severityScores.length > 0 
    ? severityScores.reduce((sum, score) => sum + score, 0) / severityScores.length
    : 0

  return {
    totalCases,
    totalLosses,
    totalRecovery,
    averageSeverity,
    recoveryRate: totalLosses > 0 ? (totalRecovery / totalLosses) * 100 : 0
  }
}