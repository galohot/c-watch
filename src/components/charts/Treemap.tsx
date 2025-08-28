'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useCorruptionCases } from '@/hooks/useCorruptionCases'
import { CorruptionCase } from '@/lib/supabase'

interface TreemapProps {
  width?: number
  height?: number
  className?: string
}

interface TreemapNode {
  name: string
  value: number
  children?: TreemapNode[]
  sector?: string
  region?: string
  caseCount?: number
  averageSeverity?: number
  x0?: number
  y0?: number
  x1?: number
  y1?: number
  depth?: number
  parent?: TreemapNode
}

type ViewMode = 'sector' | 'region' | 'combined'

export default function Treemap({ 
  width = 800, 
  height = 600, 
  className = '' 
}: TreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('sector')
  const [selectedNode, setSelectedNode] = useState<TreemapNode | null>(null)
  const [currentRoot, setCurrentRoot] = useState<TreemapNode | null>(null)
  const { cases, loading, error } = useCorruptionCases()

  useEffect(() => {
    if (!cases || loading || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Process data based on view mode
    let hierarchyData: TreemapNode

    if (viewMode === 'sector') {
      const sectorMap = new Map<string, { value: number, count: number, severity: number[] }>()
      
      cases.forEach((case_: CorruptionCase) => {
        const sector = case_.sector || 'Unknown'
        const losses = case_.estimated_losses_idr || 0
        const severity = case_.corruption_severity_score || 0
        
        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, { value: 0, count: 0, severity: [] })
        }
        
        const sectorData = sectorMap.get(sector)!
        sectorData.value += losses
        sectorData.count += 1
        sectorData.severity.push(severity)
      })

      hierarchyData = {
        name: 'Corruption by Sector',
        value: 0,
        children: Array.from(sectorMap.entries()).map(([sector, data]) => ({
          name: sector,
          value: data.value,
          sector,
          caseCount: data.count,
          averageSeverity: data.severity.reduce((a, b) => a + b, 0) / data.severity.length
        }))
      }
    } else if (viewMode === 'region') {
      const regionMap = new Map<string, { value: number, count: number, severity: number[] }>()
      
      cases.forEach((case_: CorruptionCase) => {
        const regions = case_.regions_affected || ['Unknown']
        const losses = (case_.estimated_losses_idr || 0) / regions.length // Distribute losses across regions
        const severity = case_.corruption_severity_score || 0
        
        regions.forEach((region: string) => {
          if (!regionMap.has(region)) {
            regionMap.set(region, { value: 0, count: 0, severity: [] })
          }
          
          const regionData = regionMap.get(region)!
          regionData.value += losses
          regionData.count += 1
          regionData.severity.push(severity)
        })
      })

      hierarchyData = {
        name: 'Corruption by Region',
        value: 0,
        children: Array.from(regionMap.entries()).map(([region, data]) => ({
          name: region,
          value: data.value,
          region,
          caseCount: data.count,
          averageSeverity: data.severity.reduce((a, b) => a + b, 0) / data.severity.length
        }))
      }
    } else { // combined
      const sectorRegionMap = new Map<string, Map<string, { value: number, count: number, severity: number[] }>>()
      
      cases.forEach((case_: CorruptionCase) => {
        const sector = case_.sector || 'Unknown'
        const regions = case_.regions_affected || ['Unknown']
        const losses = (case_.estimated_losses_idr || 0) / regions.length
        const severity = case_.corruption_severity_score || 0
        
        if (!sectorRegionMap.has(sector)) {
          sectorRegionMap.set(sector, new Map())
        }
        
        const sectorMap = sectorRegionMap.get(sector)!
        
        regions.forEach((region: string) => {
          if (!sectorMap.has(region)) {
            sectorMap.set(region, { value: 0, count: 0, severity: [] })
          }
          
          const regionData = sectorMap.get(region)!
          regionData.value += losses
          regionData.count += 1
          regionData.severity.push(severity)
        })
      })

      hierarchyData = {
        name: 'Corruption by Sector & Region',
        value: 0,
        children: Array.from(sectorRegionMap.entries()).map(([sector, regionMap]) => ({
          name: sector,
          value: Array.from(regionMap.values()).reduce((sum, data) => sum + data.value, 0),
          sector,
          children: Array.from(regionMap.entries()).map(([region, data]) => ({
            name: region,
            value: data.value,
            sector,
            region,
            caseCount: data.count,
            averageSeverity: data.severity.reduce((a, b) => a + b, 0) / data.severity.length
          }))
        }))
      }
    }

    // Create hierarchy
    const root = d3.hierarchy<TreemapNode>(hierarchyData)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    // Create treemap layout
    const treemap = d3.treemap<TreemapNode>()
      .size([width, height])
      .padding(2)
      .round(true)

    treemap(root)

    // Enhanced color scales with modern gradients
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(root.leaves(), d => d.data.averageSeverity || 0) || 10])
      .interpolator(d3.interpolateRgb('#10b981', '#ef4444'))

    const sectorColorScale = d3.scaleOrdinal([
      '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#ec4899', '#84cc16', '#f97316', '#6366f1'
    ])

    // Create container group
    const container = svg.append('g')

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Function to render treemap
    const renderTreemap = (nodes: d3.HierarchyRectangularNode<TreemapNode>[]) => {
      container.selectAll('*').remove()

      // Create cells
      const cell = container.selectAll('.cell')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'cell')
        .attr('transform', d => `translate(${d.x0},${d.y0})`)
        .style('cursor', d => d.children ? 'pointer' : 'default')
        .on('click', (event, d) => {
          if (d.children) {
            // Zoom into this node
            setCurrentRoot(d.data)
            const newNodes = d.children.filter(child => (child.x1! - child.x0!) * (child.y1! - child.y0!) > 100)
            renderTreemap(newNodes)
          } else {
            setSelectedNode(d.data)
          }
        })

      // Add rectangles with enhanced styling
      cell.append('rect')
        .attr('width', d => Math.max(0, d.x1! - d.x0!))
        .attr('height', d => Math.max(0, d.y1! - d.y0!))
        .attr('fill', d => {
          if (d.data.averageSeverity) {
            return colorScale(d.data.averageSeverity)
          } else if (d.data.sector) {
            return sectorColorScale(d.data.sector)
          } else {
            return '#10b981'
          }
        })
        .attr('stroke', '#1f2937')
        .attr('stroke-width', 2)
        .attr('opacity', 0.85)
        .attr('rx', 4)
        .attr('ry', 4)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
        .on('mouseover', function() {
          d3.select(this)
            .attr('opacity', 1)
            .attr('stroke-width', 3)
            .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)) brightness(1.1)')
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('opacity', 0.85)
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
        })

      // Add text labels with enhanced styling
      cell.append('text')
        .attr('x', 8)
        .attr('y', 20)
        .attr('fill', '#ffffff')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('font-size', d => {
          const area = (d.x1! - d.x0!) * (d.y1! - d.y0!)
          return Math.min(14, Math.max(10, Math.sqrt(area) / 12)) + 'px'
        })
        .attr('font-weight', '600')
        .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
        .text(d => {
          const width = d.x1! - d.x0!
          const maxChars = Math.floor(width / 9)
          return d.data.name.length > maxChars ? 
            d.data.name.substring(0, maxChars - 3) + '...' : 
            d.data.name
        })
        .filter(d => (d.x1! - d.x0!) > 60 && (d.y1! - d.y0!) > 25)

      // Add value labels with enhanced styling
      cell.append('text')
        .attr('x', 8)
        .attr('y', 38)
        .attr('fill', '#e5e7eb')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
        .text(d => `Rp ${(d.value! / 1e9).toFixed(1)}B`)
        .filter(d => (d.x1! - d.x0!) > 90 && (d.y1! - d.y0!) > 45)

      // Add case count labels with enhanced styling
      cell.append('text')
        .attr('x', 8)
        .attr('y', 54)
        .attr('fill', '#d1d5db')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', '400')
        .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
        .text(d => d.data.caseCount ? `${d.data.caseCount} cases` : '')
        .filter(d => (d.x1! - d.x0!) > 110 && (d.y1! - d.y0!) > 65)
    }

    // Initial render
    const initialNodes = currentRoot ? 
      root.descendants().filter(d => d.parent?.data === currentRoot) :
      root.children || []
    
    renderTreemap(initialNodes.filter(d => {
      const rect = d as d3.HierarchyRectangularNode<TreemapNode>
      return (rect.x1 - rect.x0) * (rect.y1 - rect.y0) > 100
    }) as d3.HierarchyRectangularNode<TreemapNode>[])

    // Add title with enhanced styling
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)')
      .text(currentRoot ? currentRoot.name : hierarchyData.name)

  }, [cases, loading, viewMode, currentRoot, width, height])

  if (loading) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm ${className}`} style={{ width, height }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse" />
        <div className="relative flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-slate-800/50 border border-slate-600/30">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-300 font-medium">Loading treemap data...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-slate-900/90 via-red-900/20 to-slate-900/90 backdrop-blur-sm ${className}`} style={{ width, height }}>
        <div className="relative flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-red-900/20 border border-red-500/30">
              <div className="w-5 h-5 text-red-400">⚠</div>
              <span className="text-red-300 font-medium">Error loading treemap data: {error || 'Unknown error'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse" />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-3">
        <select
          value={viewMode}
          onChange={(e) => {
            setViewMode(e.target.value as ViewMode)
            setCurrentRoot(null)
          }}
          className="bg-slate-800/80 border border-slate-600/50 text-slate-200 font-medium text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm transition-all duration-200 hover:border-slate-500"
        >
          <option value="sector">By Sector</option>
          <option value="region">By Region</option>
          <option value="combined">Sector & Region</option>
        </select>
        
        {currentRoot && (
          <button
            onClick={() => setCurrentRoot(null)}
            className="bg-slate-800/80 border border-slate-600/50 text-slate-200 font-medium text-sm px-3 py-2 rounded-lg hover:border-slate-500 hover:bg-slate-700/80 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
        )}
      </div>

      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-slate-800/95 border border-slate-600/50 p-4 rounded-xl z-10 max-w-xs backdrop-blur-sm shadow-xl">
          <div className="text-slate-200 text-sm space-y-2">
            <div className="font-bold text-white text-base mb-3">{selectedNode.name}</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Losses:</span>
              <span className="font-semibold text-emerald-400">Rp {(selectedNode.value / 1e9).toFixed(2)}B</span>
            </div>
            {selectedNode.caseCount && (
              <div className="flex justify-between">
                <span className="text-slate-400">Cases:</span>
                <span className="font-semibold text-blue-400">{selectedNode.caseCount}</span>
              </div>
            )}
            {selectedNode.averageSeverity && (
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Severity:</span>
                <span className="font-semibold text-orange-400">{selectedNode.averageSeverity.toFixed(1)}</span>
              </div>
            )}
            {selectedNode.sector && (
              <div className="flex justify-between">
                <span className="text-slate-400">Sector:</span>
                <span className="font-semibold text-purple-400">{selectedNode.sector}</span>
              </div>
            )}
            {selectedNode.region && (
              <div className="flex justify-between">
                <span className="text-slate-400">Region:</span>
                <span className="font-semibold text-cyan-400">{selectedNode.region}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-3 w-full text-red-400 hover:text-red-300 text-sm font-medium py-1 px-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      )}
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="relative z-0"
        style={{ background: 'transparent' }}
      />
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-slate-400 text-sm opacity-80">
        Click to zoom • Scroll to pan • Hover for details
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-800/80 border border-slate-600/50 p-3 rounded-lg text-slate-200 text-sm backdrop-blur-sm">
        <div className="font-semibold mb-2 text-white">Color Scale:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            <span>Low Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span>High Severity</span>
          </div>
        </div>
      </div>
    </div>
  )
}