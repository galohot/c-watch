'use client'

import { cn } from '../../lib/utils'

// Define interfaces
export interface ProvinceData {
  provinceName: string
  corruptionIntensity: number
  caseCount: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ChoroplethMapProps {
  data: ProvinceData[]
  className?: string
  interactive?: boolean
  showTooltip?: boolean
  valueFormat?: (value: number) => string
}

export function ChoroplethMap({
  data,
  className,
  valueFormat = (value) => value.toFixed(2)
}: ChoroplethMapProps) {
  // Calculate statistics for display
  const totalProvinces = data.length
  const avgIntensity = data.reduce((sum, item) => sum + item.corruptionIntensity, 0) / totalProvinces
  const highRiskProvinces = data.filter(item => item.corruptionIntensity >= 6).length

  return (
    <div className={cn(
      'w-full h-96 bg-gray-900/50 border border-orange-500/20 rounded-lg overflow-hidden',
      'flex flex-col items-center justify-center p-6 text-center',
      className
    )}>
      <div className="mb-4">
        <div className="text-orange-400 text-lg font-bold mb-2">Indonesia Corruption Map</div>
        <div className="text-gray-300 text-sm mb-4">Interactive map temporarily unavailable</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
        <div className="bg-gray-800/50 p-3 rounded border border-orange-500/20">
          <div className="text-orange-400 text-sm font-medium">Total Provinces</div>
          <div className="text-white text-xl font-bold">{totalProvinces}</div>
        </div>
        
        <div className="bg-gray-800/50 p-3 rounded border border-orange-500/20">
          <div className="text-orange-400 text-sm font-medium">Avg Intensity</div>
          <div className="text-white text-xl font-bold">{valueFormat(avgIntensity)}</div>
        </div>
        
        <div className="bg-gray-800/50 p-3 rounded border border-orange-500/20">
          <div className="text-orange-400 text-sm font-medium">High Risk</div>
          <div className="text-white text-xl font-bold">{highRiskProvinces}</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        Map functionality will be restored in a future update
      </div>
    </div>
  )
}