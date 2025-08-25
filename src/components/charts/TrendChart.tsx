'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../lib/utils'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface TrendData {
  period: string
  value: number
  trend: 'up' | 'down' | 'stable'
  percentage?: number
}

interface TrendChartProps {
  data: TrendData[]
  width?: number
  height?: number
  className?: string
  loading?: boolean
  title?: string
  showTrendLine?: boolean
  showPercentages?: boolean
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export function TrendChart({
  data,
  width = 600,
  height = 300,
  className,
  loading = false,
  title,
  showTrendLine = true,
  showPercentages = true,
  timeframe = 'monthly'
}: TrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredData, setHoveredData] = useState<TrendData | null>(null)

  useEffect(() => {
    if (!data.length || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 30, bottom: 50, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.period))
      .range([0, innerWidth])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([innerHeight, 0])

    // Color scale for trends
    const trendColors = {
      up: '#10b981',
      down: '#ef4444',
      stable: '#f59e0b'
    }

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.2)
      .style('stroke', '#f97316')

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.2)
      .style('stroke', '#f97316')

    // Bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.period) || 0)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', d => trendColors[d.trend])
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill-opacity', 0.8)
        setHoveredData(d)
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill-opacity', 1)
        setHoveredData(null)
      })

    // Trend line
    if (showTrendLine) {
      const line = d3.line<TrendData>()
        .x(d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#f97316')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line)

      // Trend points
      g.selectAll('.trend-point')
        .data(data)
        .enter().append('circle')
        .attr('class', 'trend-point')
        .attr('cx', d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.value))
        .attr('r', 3)
        .attr('fill', '#f97316')
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
    }

    // Percentage labels
    if (showPercentages) {
      g.selectAll('.percentage')
        .data(data.filter(d => d.percentage !== undefined))
        .enter().append('text')
        .attr('class', 'percentage')
        .attr('x', d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 10)
        .attr('text-anchor', 'middle')
        .style('fill', d => trendColors[d.trend])
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text(d => `${d.percentage! > 0 ? '+' : ''}${d.percentage}%`)
    }

    // Trend arrows
    g.selectAll('.trend-arrow')
      .data(data)
      .enter().append('text')
      .attr('class', 'trend-arrow')
      .attr('x', d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) + (innerHeight - yScale(d.value)) / 2)
      .attr('text-anchor', 'middle')
      .style('fill', d => trendColors[d.trend])
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(d => {
        switch (d.trend) {
          case 'up': return '▲'
          case 'down': return '▼'
          case 'stable': return '●'
          default: return '●'
        }
      })

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('color', '#f97316')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono')
      .style('font-size', '10px')

    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('color', '#f97316')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono')
      .style('font-size', '10px')

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

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 120}, 50)`)

    const legendData = [
      { label: 'Increasing', color: trendColors.up },
      { label: 'Decreasing', color: trendColors.down },
      { label: 'Stable', color: trendColors.stable }
    ]

    legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)
      .each(function(d) {
        const item = d3.select(this)
        
        item.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', d.color)
          .attr('stroke', '#000')
          .attr('stroke-width', 1)
        
        item.append('text')
          .attr('x', 16)
          .attr('y', 9)
          .style('fill', '#f97316')
          .style('font-family', 'JetBrains Mono')
          .style('font-size', '10px')
          .text(d.label)
      })

  }, [data, width, height, loading, showTrendLine, showPercentages, title])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
        <LoadingSpinner text="Loading trend data..." />
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
      {hoveredData && (
        <div className="absolute top-2 left-2 bg-black border border-orange-400 p-2 text-xs font-mono text-orange-400 z-10">
          <div className="font-bold">{hoveredData.period}</div>
          <div>Value: {hoveredData.value.toLocaleString()}</div>
          <div className="flex items-center space-x-1">
            <span>Trend:</span>
            <span className={cn(
              'font-bold',
              hoveredData.trend === 'up' && 'text-green-400',
              hoveredData.trend === 'down' && 'text-red-400',
              hoveredData.trend === 'stable' && 'text-yellow-400'
            )}>
              {hoveredData.trend.toUpperCase()}
            </span>
          </div>
          {hoveredData.percentage !== undefined && (
            <div>Change: {hoveredData.percentage > 0 ? '+' : ''}{hoveredData.percentage}%</div>
          )}
        </div>
      )}
    </div>
  )
}