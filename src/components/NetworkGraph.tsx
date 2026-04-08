import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Stakeholder, Relationship, PowerBase } from '../types';

interface NetworkGraphProps {
  stakeholders: Stakeholder[];
  relationships: Relationship[];
  activeTab: PowerBase | 'overview';
  onNodeClick: (stakeholder: Stakeholder) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  stakeholder: Stakeholder;
  radius: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  strength: number;
}

export function NetworkGraph({ stakeholders, relationships, activeTab, onNodeClick }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Calculate aggregate influence score for overview or use specific power base
    const getScore = (s: Stakeholder) => {
      if (activeTab === 'overview') {
        const scores = Object.values(s.powerScores);
        return scores.reduce((a, b) => a + b, 0) / scores.length;
      }
      return s.powerScores[activeTab];
    };

    // Color scale based on score
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([1, 5]);

    const nodes: Node[] = stakeholders.map(s => ({
      id: s.id,
      stakeholder: s,
      radius: 15 + (getScore(s) * 5), // Size based on score
    }));

    const links: Link[] = relationships.map(r => ({
      source: r.sourceId,
      target: r.targetId,
      strength: r.strength,
    }));

    // Define arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .join('marker')
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25) // Adjust based on node radius
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
      .append('path')
        .attr('fill', '#9ca3af')
        .attr('d', 'M0,-5L10,0L0,5');

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as Node).radius + 10));

    const link = g.append('g')
      .attr('stroke', '#9ca3af')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2)
      .attr('marker-end', 'url(#end)');

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.stakeholder);
      });

    // Node circles
    nodeGroup.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => activeTab === 'overview' ? '#3b82f6' : colorScale(getScore(d.stakeholder)))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'cursor-pointer transition-all duration-200 hover:stroke-blue-400 hover:stroke-[3px]');

    // Node labels
    nodeGroup.append('text')
      .text(d => d.stakeholder.name)
      .attr('x', 0)
      .attr('y', d => d.radius + 15)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs font-medium fill-gray-700 select-none pointer-events-none');
      
    nodeGroup.append('text')
      .text(d => d.stakeholder.role)
      .attr('x', 0)
      .attr('y', d => d.radius + 28)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[10px] fill-gray-500 select-none pointer-events-none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      nodeGroup
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Re-adjust refX for arrows dynamically based on target node radius
    link.attr('marker-end', d => {
      // We can't easily do dynamic refX per link with a single marker, 
      // but we can adjust the line end point slightly if needed.
      // For simplicity, we just use the static marker and it might overlap slightly on large nodes.
      return 'url(#end)';
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
    };
  }, [stakeholders, relationships, activeTab, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      {stakeholders.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No stakeholders added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add stakeholders and relationships using the panel on the left.</p>
          </div>
        </div>
      )}
    </div>
  );
}
