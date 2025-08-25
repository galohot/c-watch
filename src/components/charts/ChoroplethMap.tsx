'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../lib/utils'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ProvinceData {
  provinceId: string
  provinceName: string
  corruptionIntensity: number
  caseCount: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, unknown>
}

interface GeoFeature {
  type: 'Feature'
  properties: {
    NAME_1: string
    ID_1: string
    [key: string]: unknown
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  } | {
    type: 'MultiPolygon'
    coordinates: number[][][][]
  }
}

interface GeoData {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

interface ChoroplethMapProps {
  data: ProvinceData[]
  geoData?: GeoData
  width?: number
  height?: number
  className?: string
  loading?: boolean
  title?: string
  colorScheme?: 'reds' | 'oranges' | 'blues' | 'greens' | 'purples'
  interactive?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  onProvinceClick?: (province: ProvinceData) => void
  onProvinceHover?: (province: ProvinceData | null) => void
  valueFormat?: (value: number) => string
}

// Default Indonesia provinces GeoJSON structure (simplified)
const defaultGeoData: GeoData = {
  type: 'FeatureCollection',
  features: [
    // This would typically be loaded from an external GeoJSON file
    // For now, we'll create a placeholder structure
  ]
}

export function ChoroplethMap({
  data,
  geoData = defaultGeoData,
  width = 800,
  height = 600,
  className,
  loading = false,
  title,
  colorScheme = 'reds',
  interactive = true,
  showLegend = true,
  showTooltip = true,
  onProvinceClick,
  onProvinceHover,
  valueFormat = (value: number) => value.toFixed(2)
}: ChoroplethMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProvinceData } | null>(null)
  const [, setHoveredProvince] = useState<string | null>(null)

  useEffect(() => {
    if (!data.length || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 120, bottom: 40, left: 40 }
    const mapWidth = width - margin.left - margin.right - (showLegend ? 100 : 0)
    const mapHeight = height - margin.top - margin.bottom

    const container = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create data map for quick lookup
    const dataMap = new Map(data.map(d => [d.provinceId, d]))

    // Color scale based on corruption intensity

    const maxIntensity = d3.max(data, d => d.corruptionIntensity) || 1
    const colorScale = d3.scaleSequential()
      .domain([0, maxIntensity])
      .interpolator(d3.interpolateRgb('#1a1a1a', '#ef4444'))

    // Alternative discrete color scale for severity levels (removed unused variable)

    // Projection for Indonesia
    const projection = d3.geoMercator()
      .center([118, -2]) // Center of Indonesia
      .scale(800)
      .translate([mapWidth / 2, mapHeight / 2])

    const path = d3.geoPath().projection(projection)

    // If we have actual GeoJSON data, render the map
    if (geoData.features.length > 0) {
      container.selectAll('.province')
        .data(geoData.features)
        .enter().append('path')
        .attr('class', 'province')
        .attr('d', d => path(d))
        .attr('fill', d => {
          const provinceData = dataMap.get(d.properties.ID_1)
          if (!provinceData) return '#2a2a2a'
          return colorScale(provinceData.corruptionIntensity)
        })
        .attr('stroke', '#f97316')
        .attr('stroke-width', 1)
        .style('cursor', interactive ? 'pointer' : 'default')
        .on('mouseover', function(event, d) {
          if (!interactive) return
          
          const provinceData = dataMap.get(d.properties.ID_1)
          if (!provinceData) return

          d3.select(this)
            .attr('stroke-width', 2)
            .attr('stroke', '#fbbf24')

          setHoveredProvince(d.properties.ID_1)
          
          if (showTooltip) {
            const [x, y] = d3.pointer(event, svg.node())
            setTooltip({ x, y, data: provinceData })
          }

          if (onProvinceHover) {
            onProvinceHover(provinceData)
          }
        })
        .on('mouseout', function() {
          if (!interactive) return

          d3.select(this)
            .attr('stroke-width', 1)
            .attr('stroke', '#f97316')

          setHoveredProvince(null)
          setTooltip(null)

          if (onProvinceHover) {
            onProvinceHover(null)
          }
        })
        .on('click', function(event, d) {
          if (!interactive) return

          const provinceData = dataMap.get(d.properties.ID_1)
          if (!provinceData) return

          if (onProvinceClick) {
            onProvinceClick(provinceData)
          }
        })
    } else {
      // Fallback: Create a simple grid representation of provinces
      const gridCols = 6
      const gridRows = Math.ceil(data.length / gridCols)
      const cellWidth = mapWidth / gridCols
      const cellHeight = mapHeight / gridRows

      container.selectAll('.province-cell')
        .data(data)
        .enter().append('rect')
        .attr('class', 'province-cell')
        .attr('x', (d, i) => (i % gridCols) * cellWidth)
        .attr('y', (d, i) => Math.floor(i / gridCols) * cellHeight)
        .attr('width', cellWidth - 2)
        .attr('height', cellHeight - 2)
        .attr('fill', d => colorScale(d.corruptionIntensity))
        .attr('stroke', '#f97316')
        .attr('stroke-width', 1)
        .style('cursor', interactive ? 'pointer' : 'default')
        .on('mouseover', function(event, d) {
          if (!interactive) return

          d3.select(this)
            .attr('stroke-width', 2)
            .attr('stroke', '#fbbf24')

          setHoveredProvince(d.provinceId)
          
          if (showTooltip) {
            const [x, y] = d3.pointer(event, svg.node())
            setTooltip({ x, y, data: d })
          }

          if (onProvinceHover) {
            onProvinceHover(d)
          }
        })
        .on('mouseout', function() {
          if (!interactive) return

          d3.select(this)
            .attr('stroke-width', 1)
            .attr('stroke', '#f97316')

          setHoveredProvince(null)
          setTooltip(null)

          if (onProvinceHover) {
            onProvinceHover(null)
          }
        })
        .on('click', function(event, d) {
          if (!interactive) return

          if (onProvinceClick) {
            onProvinceClick(d)
          }
        })

      // Add province labels for grid view
      container.selectAll('.province-label')
        .data(data)
        .enter().append('text')
        .attr('class', 'province-label')
        .attr('x', (d, i) => (i % gridCols) * cellWidth + cellWidth / 2)
        .attr('y', (d, i) => Math.floor(i / gridCols) * cellHeight + cellHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', '#ffffff')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(d => d.provinceName.length > 8 ? d.provinceName.substring(0, 8) + '...' : d.provinceName)
    }

    // Legend
    if (showLegend) {
      const legendHeight = 200
      const legendX = mapWidth + 20
      const legendY = 50

      const legend = container.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendX}, ${legendY})`)

      // Legend title
      legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('fill', '#f97316')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Corruption Intensity')

      // Create gradient for legend
      const defs = svg.append('defs')
      const gradient = defs.append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%')

      const steps = 10
      for (let i = 0; i <= steps; i++) {
        gradient.append('stop')
          .attr('offset', `${(i / steps) * 100}%`)
          .attr('stop-color', colorScale(maxIntensity * i / steps))
      }

      // Legend rectangle
      legend.append('rect')
        .attr('width', 20)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)')
        .attr('stroke', '#f97316')
        .attr('stroke-width', 1)

      // Legend scale
      const legendScale = d3.scaleLinear()
        .domain([0, maxIntensity])
        .range([legendHeight, 0])

      const legendAxis = d3.axisRight(legendScale)
        .tickFormat((d: d3.NumberValue) => valueFormat(d.valueOf()))
        .ticks(5)

      legend.append('g')
        .attr('transform', 'translate(20, 0)')
        .call(legendAxis as d3.Axis<d3.NumberValue>)
        .style('color', '#f97316')
        .selectAll('text')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '10px')
    }

    // Title
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .style('fill', '#f97316')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title)
    }

  }, [data, geoData, loading, width, height, colorScheme, interactive, showLegend, valueFormat, onProvinceClick, onProvinceHover, showTooltip, title])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-black border border-orange-500"
      />
      
      {tooltip && showTooltip && (
        <div
          className="absolute z-10 bg-black border border-orange-500 p-3 rounded text-orange-500 text-xs font-mono pointer-events-none max-w-xs"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-bold text-sm mb-1">{tooltip.data.provinceName}</div>
          <div>Intensity: {valueFormat(tooltip.data.corruptionIntensity)}</div>
          <div>Cases: {tooltip.data.caseCount}</div>
          <div className="flex items-center gap-1">
            <span>Severity:</span>
            <span 
              className={cn(
                'px-1 py-0.5 rounded text-xs',
                tooltip.data.severity === 'low' && 'bg-green-500 text-black',
                tooltip.data.severity === 'medium' && 'bg-yellow-500 text-black',
                tooltip.data.severity === 'high' && 'bg-orange-500 text-black',
                tooltip.data.severity === 'critical' && 'bg-red-500 text-white'
              )}
            >
              {tooltip.data.severity}
            </span>
          </div>
        </div>
      )}
      
      {interactive && (
        <div className="absolute bottom-2 left-2 text-xs text-orange-500 font-mono">
          Click provinces for details • Hover for info
        </div>
      )}
    </div>
  )
}