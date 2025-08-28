'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../lib/utils'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ChartData {
  date: string
  value: number
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface ProcessedChartData {
  date: Date
  value: number
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface CorruptionChartProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'area' | 'scatter'
  width?: number
  height?: number
  className?: string
  loading?: boolean
  error?: string
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  showGrid?: boolean
  interactive?: boolean
}

export function CorruptionChart({
  data,
  type,
  width = 800,
  height = 400,
  className,
  loading = false,
  error,
  title,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  interactive = true
}: CorruptionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedChartData } | null>(null)

  useEffect(() => {
    if (!data.length || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 30, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d')
    const processedData = data.map(d => ({
      ...d,
      date: parseDate(d.date) || new Date()
    }))

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) || 0])
      .range([innerHeight, 0])

    // Color scale for severity
    const colorScale = d3.scaleOrdinal()
      .domain(['low', 'medium', 'high', 'critical'])
      .range(['#10b981', '#f59e0b', '#f97316', '#ef4444'])

    // Grid
    if (showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3)
        .style('stroke', '#f97316')

      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3)
        .style('stroke', '#f97316')
    }

    // Chart rendering based on type
    if (type === 'line' || type === 'area') {
      const line = d3.line<ProcessedChartData>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX)

      if (type === 'area') {
        const area = d3.area<ProcessedChartData>()
          .x(d => xScale(d.date))
          .y0(innerHeight)
          .y1(d => yScale(d.value))
          .curve(d3.curveMonotoneX)

        g.append('path')
          .datum(processedData)
          .attr('fill', '#f97316')
          .attr('fill-opacity', 0.2)
          .attr('d', area)
      }

      g.append('path')
        .datum(processedData)
        .attr('fill', 'none')
        .attr('stroke', '#f97316')
        .attr('stroke-width', 2)
        .attr('d', line)

      // Data points
      g.selectAll('.dot')
        .data(processedData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', d => colorScale(d.severity || 'medium') as string)
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .style('cursor', interactive ? 'pointer' : 'default')
      
      if (interactive) {
        g.selectAll('.dot')
          .on('mouseover', function(event: MouseEvent, d: unknown) {
            const data = d as ProcessedChartData
            d3.select(this).attr('r', 6)
            const [x, y] = d3.pointer(event, svg.node())
            setTooltip({ x, y, data })
          })
          .on('mouseout', function() {
            d3.select(this).attr('r', 4)
            setTooltip(null)
          })
      }
    }

    if (type === 'bar') {
      const barWidth = innerWidth / processedData.length * 0.8

      g.selectAll('.bar')
        .data(processedData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.date) - barWidth / 2)
        .attr('y', d => yScale(d.value))
        .attr('width', barWidth)
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => colorScale(d.severity || 'medium') as string)
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .style('cursor', interactive ? 'pointer' : 'default')
      
      if (interactive) {
        g.selectAll('.bar')
          .on('mouseover', function(event: MouseEvent, d: unknown) {
            const data = d as ProcessedChartData
            d3.select(this).attr('fill-opacity', 0.8)
            const [x, y] = d3.pointer(event, svg.node())
            setTooltip({ x, y, data })
          })
          .on('mouseout', function() {
            d3.select(this).attr('fill-opacity', 1)
            setTooltip(null)
          })
      }
    }

    if (type === 'scatter') {
      g.selectAll('.dot')
        .data(processedData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 6)
        .attr('fill', d => colorScale(d.severity || 'medium') as string)
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .attr('fill-opacity', 0.7)
        .style('cursor', interactive ? 'pointer' : 'default')
      
      if (interactive) {
         g.selectAll('.dot')
           .on('mouseover', function(event: MouseEvent, d: unknown) {
             const data = d as ProcessedChartData
             d3.select(this).attr('r', 8).attr('fill-opacity', 1)
             const [x, y] = d3.pointer(event, svg.node())
             setTooltip({ x, y, data })
           })
           .on('mouseout', function() {
             d3.select(this).attr('r', 6).attr('fill-opacity', 0.7)
             setTooltip(null)
           })
       }
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d') as (domainValue: Date | d3.NumberValue, index: number) => string))
      .style('color', '#f97316')

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.0f')))
      .style('color', '#f97316')

    // Axis labels
    if (xAxisLabel) {
      svg.append('text')
        .attr('transform', `translate(${width / 2}, ${height - 10})`)
        .style('text-anchor', 'middle')
        .style('fill', '#f97316')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '12px')
        .text(xAxisLabel)
    }

    if (yAxisLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 20)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .style('fill', '#f97316')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '12px')
        .text(yAxisLabel)
    }

    // Title
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 25)
        .style('text-anchor', 'middle')
        .style('fill', '#f97316')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title)
    }
  }, [data, type, width, height, loading, showGrid, interactive, title, xAxisLabel, yAxisLabel])

  if (loading) {
    return (
      <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-cyan-500/30 backdrop-blur-sm', className)} style={{ width, height }}>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="relative flex items-center justify-center h-full">
          <LoadingSpinner size="lg" text="Loading chart data..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 via-red-900/20 to-slate-900/90 border border-red-500/30 backdrop-blur-sm', className)} style={{ width, height }}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-red-500/5 animate-pulse" />
        <div className="relative flex flex-col items-center justify-center space-y-4 h-full">
          <div className="text-red-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="font-['JetBrains_Mono'] text-sm font-semibold tracking-wide">Chart Error</p>
            <p className="font-['JetBrains_Mono'] text-xs text-red-400/70 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-cyan-500/20 backdrop-blur-sm', className)} style={{ width, height }}>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
        <div className="relative flex flex-col items-center justify-center space-y-4 h-full">
          <div className="text-cyan-400/60 text-center">
            <svg className="w-12 h-12 mx-auto mb-2 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="font-['JetBrains_Mono'] text-sm font-semibold tracking-wide">No Chart Data</p>
            <p className="font-['JetBrains_Mono'] text-xs mt-1">No corruption data available to display</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-cyan-500/30 backdrop-blur-sm shadow-2xl', className)}>
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-[shimmer_3s_ease-in-out_infinite]" />
      
      {/* Chart container */}
      <div className="relative p-4">
        {title && (
          <div className="mb-4">
            <h3 className="font-['JetBrains_Mono'] text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text tracking-wide">
              {title}
            </h3>
          </div>
        )}
        
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="drop-shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 50%, rgba(15, 23, 42, 0.8) 100%)',
            borderRadius: '8px',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}
        />
      </div>
      
      {tooltip && (
        <div
          className="absolute z-50 bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-cyan-400/50 rounded-lg p-3 text-xs font-['JetBrains_Mono'] text-cyan-100 pointer-events-none shadow-2xl backdrop-blur-sm"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="space-y-1">
            <div className="text-cyan-300 font-semibold">Date: {tooltip.data.date.toLocaleDateString()}</div>
            <div className="text-blue-300">Value: <span className="font-bold">{tooltip.data.value}</span></div>
            {tooltip.data.severity && (
              <div className="text-purple-300">Severity: <span className="font-bold uppercase">{tooltip.data.severity}</span></div>
            )}
            {tooltip.data.category && (
              <div className="text-green-300">Category: <span className="font-bold">{tooltip.data.category}</span></div>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-400/50" />
        </div>
      )}
    </div>
  )
}