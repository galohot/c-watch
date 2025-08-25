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
      <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
        <LoadingSpinner text="Loading chart data..." />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-black border border-orange-400/20"
      />
      {tooltip && (
        <div
          className="absolute z-10 bg-black border border-orange-400 p-2 text-xs font-mono text-orange-400 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div>Date: {tooltip.data.date.toLocaleDateString()}</div>
          <div>Value: {tooltip.data.value}</div>
          {tooltip.data.severity && (
            <div>Severity: {tooltip.data.severity.toUpperCase()}</div>
          )}
          {tooltip.data.category && (
            <div>Category: {tooltip.data.category}</div>
          )}
        </div>
      )}
    </div>
  )
}