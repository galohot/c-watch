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
      .range(['#ff4444', '#ffaa00', '#00ff00'])

    const sectorColorScale = d3.scaleOrdinal(d3.schemeCategory10)

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

    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'var(--terminal-bg)')
      .attr('stroke', 'var(--terminal-green)')
      .attr('stroke-width', 1)

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', 'var(--terminal-green)')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', d => linkScale(d.value))

    // Create nodes
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
      .attr('stroke', 'var(--terminal-green)')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
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
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', nodeScale(d.value))
          .attr('opacity', 0.8)
      })

    // Add labels
    const labels = container.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes.filter(d => d.type === 'institution' || nodeScale(d.value) > 8))
      .enter()
      .append('text')
      .text(d => d.name)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')
      .attr('fill', 'var(--terminal-green)')
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeScale(d.value) + 12)
      .style('pointer-events', 'none')

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
      .attr('fill', 'var(--terminal-green)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Institutions:')

    const instLegendItems = ['major', 'medium', 'minor']
    instLegendItems.forEach((item, i) => {
      const g = instLegend.append('g')
        .attr('transform', `translate(0, ${(i + 1) * 20})`)

      g.append('circle')
        .attr('r', 6)
        .attr('fill', institutionColorScale(item) as string)
        .attr('stroke', 'var(--terminal-green)')

      g.append('text')
        .attr('x', 15)
        .attr('y', 4)
        .attr('fill', 'var(--terminal-green)')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .text(`${item} (${item === 'major' ? '>5' : item === 'medium' ? '3-5' : '<3'} cases)`)
    })

    // Cases legend
    const caseLegend = legend.append('g')
      .attr('class', 'case-legend')
      .attr('transform', 'translate(0, 100)')

    caseLegend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'var(--terminal-green)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Cases by Sector')

    return () => {
      simulation.stop()
    }

  }, [cases, loading, width, height])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-terminal-green font-mono text-sm animate-pulse">
          Loading network data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-terminal-red font-mono text-sm">
          Error loading network data: {error || 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute top-2 right-2 bg-terminal-bg border border-terminal-green p-3 rounded z-10 max-w-xs">
          <div className="text-terminal-green font-mono text-xs">
            <div className="font-bold mb-1">{selectedNode.name}</div>
            <div>Type: {selectedNode.type}</div>
            <div>Group: {selectedNode.group}</div>
            {selectedNode.type === 'institution' && (
              <div>Total Losses: Rp {(selectedNode.value / 1e9).toFixed(1)}B</div>
            )}
            {selectedNode.type === 'case' && (
              <div>Estimated Loss: Rp {(selectedNode.value / 1e9).toFixed(1)}B</div>
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
        Drag nodes • Click for details • Scroll to zoom
      </div>
    </div>
  )
}