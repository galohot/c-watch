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

    // Color scales
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(root.leaves(), d => d.data.averageSeverity || 0) || 10])
      .interpolator(d3.interpolateRgb('#00ff00', '#ff4444'))

    const sectorColorScale = d3.scaleOrdinal(d3.schemeCategory10)

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

      // Add rectangles
      cell.append('rect')
        .attr('width', d => Math.max(0, d.x1! - d.x0!))
        .attr('height', d => Math.max(0, d.y1! - d.y0!))
        .attr('fill', d => {
          if (d.data.averageSeverity) {
            return colorScale(d.data.averageSeverity)
          } else if (d.data.sector) {
            return sectorColorScale(d.data.sector)
          } else {
            return 'var(--terminal-green)'
          }
        })
        .attr('stroke', 'var(--terminal-bg)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.8)
        .on('mouseover', function() {
          d3.select(this).attr('opacity', 1)
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 0.8)
        })

      // Add text labels
      cell.append('text')
        .attr('x', 4)
        .attr('y', 16)
        .attr('fill', 'var(--terminal-bg)')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', d => {
          const area = (d.x1! - d.x0!) * (d.y1! - d.y0!)
          return Math.min(12, Math.max(8, Math.sqrt(area) / 10)) + 'px'
        })
        .attr('font-weight', 'bold')
        .text(d => {
          const width = d.x1! - d.x0!
          const maxChars = Math.floor(width / 8)
          return d.data.name.length > maxChars ? 
            d.data.name.substring(0, maxChars - 3) + '...' : 
            d.data.name
        })
        .filter(d => (d.x1! - d.x0!) > 50 && (d.y1! - d.y0!) > 20)

      // Add value labels
      cell.append('text')
        .attr('x', 4)
        .attr('y', 32)
        .attr('fill', 'var(--terminal-bg)')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .text(d => `Rp ${(d.value! / 1e9).toFixed(1)}B`)
        .filter(d => (d.x1! - d.x0!) > 80 && (d.y1! - d.y0!) > 40)

      // Add case count labels
      cell.append('text')
        .attr('x', 4)
        .attr('y', 46)
        .attr('fill', 'var(--terminal-bg)')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '9px')
        .text(d => d.data.caseCount ? `${d.data.caseCount} cases` : '')
        .filter(d => (d.x1! - d.x0!) > 100 && (d.y1! - d.y0!) > 60)
    }

    // Initial render
    const initialNodes = currentRoot ? 
      root.descendants().filter(d => d.parent?.data === currentRoot) :
      root.children || []
    
    renderTreemap(initialNodes.filter(d => {
      const rect = d as d3.HierarchyRectangularNode<TreemapNode>
      return (rect.x1 - rect.x0) * (rect.y1 - rect.y0) > 100
    }) as d3.HierarchyRectangularNode<TreemapNode>[])

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--terminal-green)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(currentRoot ? currentRoot.name : hierarchyData.name)

  }, [cases, loading, viewMode, currentRoot, width, height])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-terminal-green font-mono text-sm animate-pulse">
          Loading treemap data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-terminal-red font-mono text-sm">
          Error loading treemap data: {error || 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <select
          value={viewMode}
          onChange={(e) => {
            setViewMode(e.target.value as ViewMode)
            setCurrentRoot(null)
          }}
          className="bg-terminal-bg border border-terminal-green text-terminal-green font-mono text-xs px-2 py-1 rounded focus:outline-none focus:border-terminal-amber"
        >
          <option value="sector">By Sector</option>
          <option value="region">By Region</option>
          <option value="combined">Sector & Region</option>
        </select>
        
        {currentRoot && (
          <button
            onClick={() => setCurrentRoot(null)}
            className="bg-terminal-bg border border-terminal-green text-terminal-green font-mono text-xs px-2 py-1 rounded hover:border-terminal-amber focus:outline-none"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute top-2 right-2 bg-terminal-bg border border-terminal-green p-3 rounded z-10 max-w-xs">
          <div className="text-terminal-green font-mono text-xs">
            <div className="font-bold mb-1">{selectedNode.name}</div>
            <div>Total Losses: Rp {(selectedNode.value / 1e9).toFixed(2)}B</div>
            {selectedNode.caseCount && (
              <div>Cases: {selectedNode.caseCount}</div>
            )}
            {selectedNode.averageSeverity && (
              <div>Avg Severity: {selectedNode.averageSeverity.toFixed(1)}</div>
            )}
            {selectedNode.sector && (
              <div>Sector: {selectedNode.sector}</div>
            )}
            {selectedNode.region && (
              <div>Region: {selectedNode.region}</div>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-2 text-terminal-red hover:text-terminal-amber text-xs"
          >
            Close
          </button>
        </div>
      )}
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-terminal-bg border border-terminal-green"
      />
      
      {/* Instructions */}
      <div className="absolute bottom-2 left-2 text-terminal-green font-mono text-xs opacity-70">
        Click to zoom • Scroll to pan • Hover for details
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-terminal-bg border border-terminal-green p-2 rounded text-terminal-green font-mono text-xs">
        <div className="font-bold mb-1">Color Scale:</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-terminal-green"></div>
          <span>Low Severity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-terminal-red"></div>
          <span>High Severity</span>
        </div>
      </div>
    </div>
  )
}