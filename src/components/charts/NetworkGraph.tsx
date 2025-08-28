'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useCorruptionCases } from '@/hooks/useCorruptionCases'
import { CorruptionCase } from '@/lib/supabase'

interface NetworkGraphProps {
  width?: number
  height?: number
  className?: string
}

interface Node extends d3.SimulationNodeDatum {
  id: string
  name: string
  type: 'institution' | 'case'
  value: number
  group: string
}

interface Link {
  source: string | Node
  target: string | Node
  value: number
  type: string
}

export default function NetworkGraph({ 
  width = 800, 
  height = 600, 
  className = '' 
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const { cases, loading, error } = useCorruptionCases()

  useEffect(() => {
    if (!cases || loading || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Process data to create nodes and links
    const institutionMap = new Map<string, { count: number, totalLosses: number, cases: string[] }>()
    const caseNodes: Node[] = []
    const links: Link[] = []

    // Process cases to extract institutions
    cases.forEach((case_: CorruptionCase) => {
      if (!case_.institutions_involved) return

      const institutions = Array.isArray(case_.institutions_involved) 
        ? case_.institutions_involved 
        : [case_.institutions_involved]

      // Add case node
      const caseNode: Node = {
        id: `case-${case_.id}`,
        name: case_.title.substring(0, 30) + '...',
        type: 'case',
        value: case_.estimated_losses_idr || 0,
        group: case_.sector || 'Unknown'
      }
      caseNodes.push(caseNode)

      institutions.forEach((inst: unknown) => {
        if (typeof inst === 'string' || (inst && typeof inst === 'object' && inst !== null && 'name' in inst)) {
          const instName = typeof inst === 'string' ? inst : (inst as { name: string }).name
          
          if (!institutionMap.has(instName)) {
            institutionMap.set(instName, { count: 0, totalLosses: 0, cases: [] })
          }
          
          const instData = institutionMap.get(instName)!
          instData.count += 1
          instData.totalLosses += case_.estimated_losses_idr || 0
          instData.cases.push(case_.id)

          // Create link between institution and case
          links.push({
            source: `inst-${instName}`,
            target: `case-${case_.id}`,
            value: case_.estimated_losses_idr || 1,
            type: 'involvement'
          })
        }
      })
    })

    // Create institution nodes
    const institutionNodes: Node[] = Array.from(institutionMap.entries()).map(([name, data]) => ({
      id: `inst-${name}`,
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      type: 'institution',
      value: data.totalLosses,
      group: data.count > 5 ? 'major' : data.count > 2 ? 'medium' : 'minor'
    }))

    // Combine all nodes
    const nodes: Node[] = [...institutionNodes, ...caseNodes.slice(0, 50)] // Limit cases for performance
    const filteredLinks = links.filter(link => 
      nodes.some(n => n.id === link.source) && nodes.some(n => n.id === link.target)
    )

    // Create scales
    const nodeScale = d3.scaleSqrt()
      .domain([0, d3.max(nodes, d => d.value) || 1])
      .range([3, 15])

    const linkScale = d3.scaleLinear()
      .domain([0, d3.max(filteredLinks, d => d.value) || 1])
      .range([0.5, 3])

    // Color scales
    const institutionColorScale = d3.scaleOrdinal()
      .domain(['major', 'medium', 'minor'])
      .range(['#ef4444', '#f59e0b', '#10b981'])

    const sectorColorScale = d3.scaleOrdinal()
      .domain(['Government', 'Education', 'Infrastructure', 'Procurement', 'Finance', 'Healthcare'])
      .range(['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'])

    // Create force simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(filteredLinks)
        .id(d => d.id)
        .distance(50)
        .strength(0.1)
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((node: d3.SimulationNodeDatum) => {
        const d = node as Node
        return nodeScale(d.value) + 2
      }))

    // Create container group
    const container = svg.append('g')

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Add background with gradient
    const defs = svg.append('defs')
    
    const gradient = defs.append('linearGradient')
      .attr('id', 'bg-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', width).attr('y2', height)
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(15, 23, 42, 0.8)')
    
    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', 'rgba(30, 41, 59, 0.6)')
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(15, 23, 42, 0.8)')
    
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#bg-gradient)')
      .attr('stroke', 'rgba(6, 182, 212, 0.3)')
      .attr('stroke-width', 1)
      .attr('rx', 8)

    // Create links with enhanced styling
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', '#06b6d4')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', d => linkScale(d.value))
      .style('filter', 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.3))')

    // Create nodes with enhanced styling
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => nodeScale(d.value))
      .attr('fill', d => {
        if (d.type === 'institution') {
          return institutionColorScale(d.group) as string
        } else {
          return sectorColorScale(d.group) as string
        }
      })
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))')
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )
      .on('click', (event, d) => {
        setSelectedNode(d)
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', nodeScale(d.value) * 1.5)
          .attr('opacity', 1)
          .style('filter', 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))')
          .attr('stroke-width', 3)
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', nodeScale(d.value))
          .attr('opacity', 0.9)
          .style('filter', 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))')
          .attr('stroke-width', 2)
      })

    // Add labels with enhanced styling
    const labels = container.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes.filter(d => d.type === 'institution' || nodeScale(d.value) > 8))
      .enter()
      .append('text')
      .text(d => d.name)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('fill', '#06b6d4')
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeScale(d.value) + 12)
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 4px rgba(6, 182, 212, 0.5)')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x || 0)
        .attr('y1', d => (d.source as Node).y || 0)
        .attr('x2', d => (d.target as Node).x || 0)
        .attr('y2', d => (d.target as Node).y || 0)

      node
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0)

      labels
        .attr('x', d => d.x || 0)
        .attr('y', d => d.y || 0)
    })

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20, 20)')

    // Institution legend
    const instLegend = legend.append('g')
      .attr('class', 'institution-legend')

    instLegend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#06b6d4')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('text-shadow', '0 0 4px rgba(6, 182, 212, 0.5)')
      .text('Institutions:')

    const instLegendItems = ['major', 'medium', 'minor']
    instLegendItems.forEach((item, i) => {
      const g = instLegend.append('g')
        .attr('transform', `translate(0, ${(i + 1) * 20})`)

      g.append('circle')
        .attr('r', 6)
        .attr('fill', institutionColorScale(item) as string)
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 1.5)
        .style('filter', 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.3))')

      g.append('text')
        .attr('x', 15)
        .attr('y', 4)
        .attr('fill', '#06b6d4')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .style('text-shadow', '0 0 2px rgba(6, 182, 212, 0.3)')
        .text(`${item} (${item === 'major' ? '>5' : item === 'medium' ? '3-5' : '<3'} cases)`)
    })

    // Cases legend
    const caseLegend = legend.append('g')
      .attr('class', 'case-legend')
      .attr('transform', 'translate(0, 100)')

    caseLegend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#06b6d4')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('text-shadow', '0 0 4px rgba(6, 182, 212, 0.5)')
      .text('Cases by Sector')

    return () => {
      simulation.stop()
    }

  }, [cases, loading, width, height])

  if (loading) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-cyan-500/30 backdrop-blur-sm ${className}`} style={{ width, height }}>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="relative flex items-center justify-center h-full">
          <div className="text-cyan-400 font-['JetBrains_Mono'] text-sm animate-pulse font-semibold tracking-wide">
            Loading network data...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 via-red-900/20 to-slate-900/90 border border-red-500/30 backdrop-blur-sm ${className}`} style={{ width, height }}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-red-500/5 animate-pulse" />
        <div className="relative flex items-center justify-center h-full">
          <div className="text-red-400 font-['JetBrains_Mono'] text-sm font-semibold tracking-wide">
            Error loading network data: {error || 'Unknown error'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-cyan-500/30 backdrop-blur-sm shadow-2xl ${className}`}>
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-[shimmer_3s_ease-in-out_infinite]" />
      
      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-cyan-400/50 rounded-lg p-4 z-50 max-w-xs shadow-2xl backdrop-blur-sm">
          <div className="text-cyan-100 font-['JetBrains_Mono'] text-xs space-y-2">
            <div className="font-bold text-cyan-300 text-sm border-b border-cyan-500/30 pb-2">{selectedNode.name}</div>
            <div className="space-y-1">
              <div className="text-blue-300">Type: <span className="font-semibold text-blue-200">{selectedNode.type}</span></div>
              <div className="text-purple-300">Group: <span className="font-semibold text-purple-200">{selectedNode.group}</span></div>
              {selectedNode.type === 'institution' && (
                <div className="text-green-300">Total Losses: <span className="font-bold text-green-200">Rp {(selectedNode.value / 1e9).toFixed(1)}B</span></div>
              )}
              {selectedNode.type === 'case' && (
                <div className="text-orange-300">Estimated Loss: <span className="font-bold text-orange-200">Rp {(selectedNode.value / 1e9).toFixed(1)}B</span></div>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded text-red-300 hover:text-red-200 text-xs font-['JetBrains_Mono'] transition-all duration-200 font-semibold"
          >
            Close
          </button>
        </div>
      )}
      
      {/* Chart container */}
      <div className="relative p-4">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="drop-shadow-lg rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 50%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}
        />
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-cyan-400/70 font-['JetBrains_Mono'] text-xs bg-slate-900/50 px-3 py-2 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          <span>Drag nodes • Click for details • Scroll to zoom</span>
        </div>
      </div>
    </div>
  )
}