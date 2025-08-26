'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useSectorStats, SectorStat } from '@/hooks/useSectorStats'

interface BarChartProps {
  width?: number
  height?: number
  className?: string
}

interface SectorData {
  sector: string
  count: number
  totalLosses: number
  averageSeverity: number
}

export default function BarChart({ 
  width = 800, 
  height = 400, 
  className = '' 
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'totalLosses' | 'averageSeverity'>('count')
  const { stats: sectorStats, loading, error } = useSectorStats()

  useEffect(() => {
    if (!sectorStats || loading || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 80, bottom: 60, left: 120 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Process data
    const processedData: SectorData[] = sectorStats.map((stat: SectorStat) => ({
      sector: stat.sector || 'Unknown',
      count: stat.caseCount,
      totalLosses: stat.totalLossesIdr || 0,
      averageSeverity: stat.averageSeverityScore || 0
    }))

    // Sort data by selected metric
    processedData.sort((a, b) => b[selectedMetric] - a[selectedMetric])

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d[selectedMetric]) || 0])
      .range([0, innerWidth])

    const yScale = d3.scaleBand()
      .domain(processedData.map(d => d.sector))
      .range([0, innerHeight])
      .padding(0.2)

    // Create color scale
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(processedData, d => d[selectedMetric]) || 0])
      .interpolator(d3.interpolateRgb('#00ff00', '#ffaa00'))

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Add background
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'var(--terminal-bg-secondary)')
      .attr('stroke', 'var(--terminal-green)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.1)

    // Create bars
    const bars = g.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('g')
      .attr('class', 'bar')

    // Add bar rectangles
    bars.append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.sector) || 0)
      .attr('width', 0) // Start with 0 width for animation
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d[selectedMetric]))
      .attr('stroke', 'var(--terminal-green)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100)
      .attr('width', d => xScale(d[selectedMetric]))

    // Add value labels
    bars.append('text')
      .attr('x', d => xScale(d[selectedMetric]) + 5)
      .attr('y', d => (yScale(d.sector) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'var(--terminal-green)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(d => {
        if (selectedMetric === 'totalLosses') {
          return `Rp ${(d[selectedMetric] / 1e9).toFixed(1)}B`
        } else if (selectedMetric === 'averageSeverity') {
          return d[selectedMetric].toFixed(1)
        } else {
          return d[selectedMetric].toString()
        }
      })
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100 + 500)
      .attr('opacity', 1)

    // Add y-axis (sector labels)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0)
      .tickPadding(10)

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', 'var(--terminal-green)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '12px')

    // Style y-axis
    g.select('.y-axis')
      .select('.domain')
      .attr('stroke', 'var(--terminal-green)')
      .attr('opacity', 0.3)

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => {
        const value = d as number
        if (selectedMetric === 'totalLosses') {
          return `${(value / 1e9).toFixed(0)}B`
        } else if (selectedMetric === 'averageSeverity') {
          return value.toFixed(1)
        } else {
          return value.toString()
        }
      })

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'var(--terminal-green)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')

    // Style x-axis
    g.select('.x-axis')
      .selectAll('line')
      .attr('stroke', 'var(--terminal-green)')
      .attr('opacity', 0.3)

    g.select('.x-axis')
      .select('.domain')
      .attr('stroke', 'var(--terminal-green)')
      .attr('opacity', 0.3)

    // Add grid lines
    g.selectAll('.grid-line')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'var(--terminal-green)')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.1)

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--terminal-green)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(`Sector Analysis - ${selectedMetric === 'count' ? 'Case Count' : 
             selectedMetric === 'totalLosses' ? 'Total Losses (IDR)' : 'Average Severity'}`)

  }, [sectorStats, loading, selectedMetric, width, height])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-terminal-green font-mono text-sm animate-pulse">
          Loading sector data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-terminal-red font-mono text-sm">
          Error loading sector data: {error || 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Metric selector */}
      <div className="absolute top-2 right-2 z-10">
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as 'count' | 'totalLosses' | 'averageSeverity')}
          className="bg-terminal-bg border border-terminal-green text-terminal-green font-mono text-xs px-2 py-1 rounded focus:outline-none focus:border-terminal-amber"
        >
          <option value="count">Case Count</option>
          <option value="totalLosses">Total Losses</option>
          <option value="averageSeverity">Avg Severity</option>
        </select>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-terminal-bg border border-terminal-green"
      />
    </div>
  )
}