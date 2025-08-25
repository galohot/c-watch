'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../lib/utils'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface TimeSeriesDataPoint {
  date: string
  value: number
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, unknown>
}

interface ProcessedTimeSeriesData {
  date: Date
  value: number
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, unknown>
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[]
  width?: number
  height?: number
  className?: string
  loading?: boolean
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  showGrid?: boolean
  interactive?: boolean
  enableZoom?: boolean
  enablePan?: boolean
  realTimeUpdate?: boolean
  lineColor?: string
  areaFill?: boolean
  showDataPoints?: boolean
  timeFormat?: string
  valueFormat?: (value: number) => string
  onDataPointClick?: (data: ProcessedTimeSeriesData) => void
  onZoom?: (domain: [Date, Date]) => void
}

export function TimeSeriesChart({
  data,
  width = 800,
  height = 400,
  className,
  loading = false,
  title,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  interactive = true,
  enableZoom = true,
  enablePan = true,
  realTimeUpdate = false,
  lineColor = '#f97316',
  areaFill = false,
  showDataPoints = true,
  timeFormat = '%Y-%m-%d',
  valueFormat = (value: number) => value.toLocaleString(),
  onDataPointClick,
  onZoom
}: TimeSeriesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedTimeSeriesData } | null>(null)
  const [, setZoomTransform] = useState<d3.ZoomTransform | null>(null)

  useEffect(() => {
    if (!data.length || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 30, bottom: 60, left: 80 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const container = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse dates
    const parseDate = d3.timeParse(timeFormat)
    const processedData = data.map(d => ({
      ...d,
      date: parseDate(d.date) || new Date(d.date)
    })).sort((a, b) => a.date.getTime() - b.date.getTime())

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

    // Zoom behavior
    let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
    if (enableZoom || enablePan) {
      zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 10])
        .extent([[0, 0], [width, height]])
        .on('zoom', (event) => {
          const transform = event.transform
          setZoomTransform(transform)
          
          const newXScale: d3.ScaleTime<number, number> = transform.rescaleX(xScale)
          
          // Update axes
          const xAxis = d3.axisBottom(newXScale)
            .tickFormat(d3.timeFormat('%m/%d') as (domainValue: Date | d3.NumberValue, index: number) => string);
          
          (container.select('.x-axis') as d3.Selection<SVGGElement, unknown, null, undefined>)
            .call(xAxis)
            .style('color', '#f97316')
            .selectAll('text')
            .style('font-family', 'JetBrains Mono')
            .style('font-size', '10px')

          // Update grid
          if (showGrid) {
            (container.select('.x-grid') as d3.Selection<SVGGElement, unknown, null, undefined>)
              .call(d3.axisBottom(newXScale)
                .tickSize(-innerHeight)
                .tickFormat(() => '')
              )
          }

          // Update line
          const line = d3.line<ProcessedTimeSeriesData>()
            .x(d => newXScale(d.date))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX)

          container.select('.line-path')
            .attr('d', line(processedData))

          // Update area if enabled
          if (areaFill) {
            const area = d3.area<ProcessedTimeSeriesData>()
              .x(d => newXScale(d.date))
              .y0(innerHeight)
              .y1(d => yScale(d.value))
              .curve(d3.curveMonotoneX)

            container.select('.area-path')
              .attr('d', area(processedData))
          }

          // Update data points
          if (showDataPoints) {
            (container.selectAll('.data-point') as d3.Selection<SVGCircleElement, ProcessedTimeSeriesData, SVGGElement, unknown>)
              .attr('cx', (d: ProcessedTimeSeriesData) => newXScale(d.date))
          }

          // Trigger zoom callback
          if (onZoom) {
            onZoom(newXScale.domain() as [Date, Date])
          }
        })

      if (!enableZoom) {
        zoom.scaleExtent([1, 1])
      }
      if (!enablePan) {
        zoom.translateExtent([[0, 0], [0, 0]])
      }

      (svg as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(zoom)
    }

    // Grid
    if (showGrid) {
      container.append('g')
        .attr('class', 'x-grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3)
        .style('stroke', '#f97316')

      container.append('g')
        .attr('class', 'y-grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3)
        .style('stroke', '#f97316')
    }

    // Area fill
    if (areaFill) {
      const area = d3.area<ProcessedTimeSeriesData>()
        .x(d => xScale(d.date))
        .y0(innerHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX)

      container.append('path')
        .datum(processedData)
        .attr('class', 'area-path')
        .attr('fill', lineColor)
        .attr('fill-opacity', 0.2)
        .attr('d', area)
    }

    // Line
    const line = d3.line<ProcessedTimeSeriesData>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    container.append('path')
      .datum(processedData)
      .attr('class', 'line-path')
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('d', line)

    // Data points
    if (showDataPoints) {
      container.selectAll('.data-point')
        .data(processedData)
        .enter().append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', d => colorScale(d.severity || 'medium') as string)
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .style('cursor', interactive ? 'pointer' : 'default')
      
      if (interactive) {
        container.selectAll('.data-point')
          .on('mouseover', function(event: MouseEvent, d: unknown) {
            const data = d as ProcessedTimeSeriesData
            d3.select(this).attr('r', 6)
            const [x, y] = d3.pointer(event, svg.node())
            setTooltip({ x, y, data })
          })
          .on('mouseout', function() {
            d3.select(this).attr('r', 4)
            setTooltip(null)
          })
          .on('click', function(event: MouseEvent, d: unknown) {
            const data = d as ProcessedTimeSeriesData
            if (onDataPointClick) {
              onDataPointClick(data)
            }
          })
      }
    }

    // Axes
    container.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat((domainValue: d3.AxisDomain) => d3.timeFormat('%m/%d')(domainValue as Date))
      )
      .style('color', '#f97316')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono')
      .style('font-size', '10px')

    container.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale)
        .tickFormat((domainValue: d3.NumberValue) => valueFormat(domainValue as number))
      )
      .style('color', '#f97316')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono')
      .style('font-size', '10px')

    // Axis labels
    if (xAxisLabel) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .style('fill', '#f97316')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '12px')
        .text(xAxisLabel)
    }

    if (yAxisLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
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
        .attr('text-anchor', 'middle')
        .style('fill', '#f97316')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title)
    }

  }, [data, loading, width, height, showGrid, interactive, enableZoom, enablePan, lineColor, areaFill, showDataPoints, timeFormat, valueFormat, onDataPointClick, onZoom, title, xAxisLabel, yAxisLabel])

  // Real-time update effect
  useEffect(() => {
    if (!realTimeUpdate) return

    const interval = setInterval(() => {
      // This would typically trigger a data refresh
      // Implementation depends on data source
    }, 5000)

    return () => clearInterval(interval)
  }, [realTimeUpdate])

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
      
      {tooltip && (
        <div
          className="absolute z-10 bg-black border border-orange-500 p-2 rounded text-orange-500 text-xs font-mono pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div>Date: {tooltip.data.date.toLocaleDateString()}</div>
          <div>Value: {valueFormat ? valueFormat(tooltip.data.value) : tooltip.data.value}</div>
          {tooltip.data.category && <div>Category: {tooltip.data.category}</div>}
          {tooltip.data.severity && <div>Severity: {tooltip.data.severity}</div>}
        </div>
      )}
      
      {(enableZoom || enablePan) && (
        <div className="absolute top-2 right-2 text-xs text-orange-500 font-mono">
          {enableZoom && 'Scroll to zoom'} {enableZoom && enablePan && '• '} {enablePan && 'Drag to pan'}
        </div>
      )}
    </div>
  )
}