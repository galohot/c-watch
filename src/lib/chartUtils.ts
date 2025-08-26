import * as d3 from 'd3';

// Common margin configuration for charts
export const defaultMargins = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 50,
};

// Chart dimensions helper
export interface ChartDimensions {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: typeof defaultMargins;
}

export function calculateDimensions(
  containerWidth: number,
  containerHeight: number,
  margin = defaultMargins
): ChartDimensions {
  const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, containerHeight - margin.top - margin.bottom);
  
  return {
    width: containerWidth,
    height: containerHeight,
    innerWidth,
    innerHeight,
    margin,
  };
}

// SVG setup helper
export function createSVG(
  container: d3.Selection<HTMLElement, unknown, null, undefined>,
  dimensions: ChartDimensions
): d3.Selection<SVGSVGElement, unknown, null, undefined> {
  return container
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)
    .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
}

// Chart group helper
export function createChartGroup(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  dimensions: ChartDimensions
): d3.Selection<SVGGElement, unknown, null, undefined> {
  return svg
    .append('g')
    .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);
}

// Axis helpers
export function createXAxis(
  chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> | d3.ScaleBand<string>,
  height: number,
  tickFormat?: (d: d3.NumberValue | Date) => string
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const axis = scale.domain().length && typeof scale.domain()[0] === 'string' 
    ? d3.axisBottom(scale as d3.ScaleBand<string>)
    : d3.axisBottom(scale as d3.AxisScale<d3.NumberValue | Date>);
  if (tickFormat) {
    axis.tickFormat(tickFormat);
  }
  
  return chartGroup
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(axis);
}

export function createYAxis(
  chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  scale: d3.ScaleLinear<number, number>,
  tickFormat?: (d: d3.NumberValue, index: number) => string
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const axis = d3.axisLeft(scale);
  
  if (tickFormat) {
    axis.tickFormat(tickFormat);
  }
  
  return chartGroup
    .append('g')
    .attr('class', 'y-axis')
    .call(axis);
}

// Tooltip helpers
export interface TooltipConfig {
  className?: string;
  offset?: { x: number; y: number };
}

export function createTooltip(
  container: d3.Selection<HTMLElement, unknown, null, undefined>,
  config: TooltipConfig = {}
): d3.Selection<HTMLDivElement, unknown, null, undefined> {
  const { className = 'chart-tooltip' } = config;
  
  return container
    .append('div')
    .attr('class', className)
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', '#00ff00')
    .style('padding', '8px')
    .style('border-radius', '4px')
    .style('font-family', 'monospace')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('z-index', '1000');
}

export function showTooltip(
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  content: string,
  event: MouseEvent,
  offset: { x: number; y: number } = { x: 10, y: -10 }
): void {
  tooltip
    .style('visibility', 'visible')
    .html(content)
    .style('left', `${event.pageX + offset.x}px`)
    .style('top', `${event.pageY + offset.y}px`);
}

export function hideTooltip(
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>
): void {
  tooltip.style('visibility', 'hidden');
}

// Data formatting helpers
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Scale helpers
export function createLinearScale(
  domain: [number, number],
  range: [number, number]
): d3.ScaleLinear<number, number> {
  return d3.scaleLinear().domain(domain).range(range);
}

export function createTimeScale(
  domain: [Date, Date],
  range: [number, number]
): d3.ScaleTime<number, number> {
  return d3.scaleTime().domain(domain).range(range);
}

export function createBandScale(
  domain: string[],
  range: [number, number],
  padding = 0.1
): d3.ScaleBand<string> {
  return d3.scaleBand().domain(domain).range(range).padding(padding);
}

// Zoom and pan helpers
export function createZoomBehavior<T extends Element>(
  scaleExtent: [number, number] = [0.5, 10]
): d3.ZoomBehavior<T, unknown> {
  return d3.zoom<T, unknown>().scaleExtent(scaleExtent);
}

// Responsive helpers
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getContainerDimensions(
  element: HTMLElement
): { width: number; height: number } {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

// Grid helpers
export function addGridLines(
  chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> | d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number>,
  dimensions: ChartDimensions
): void {
  // Horizontal grid lines
  chartGroup
    .append('g')
    .attr('class', 'grid grid-horizontal')
    .selectAll('line')
    .data(yScale.ticks())
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('x2', dimensions.innerWidth)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
    .style('stroke', '#333')
    .style('stroke-width', 0.5)
    .style('opacity', 0.3);

  // Vertical grid lines (only for linear and time scales)
  if ('ticks' in xScale) {
    chartGroup
      .append('g')
      .attr('class', 'grid grid-vertical')
      .selectAll('line')
      .data((() => {
        const scale = xScale as d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
        const ticks = scale.ticks();
        return Array.isArray(ticks) ? ticks.map(tick => typeof tick === 'number' ? tick : tick.valueOf()) : [];
      })())
      .enter()
      .append('line')
      .attr('x1', (d) => (xScale as d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>)(d))
      .attr('x2', (d) => (xScale as d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>)(d))
      .attr('y1', 0)
      .attr('y2', dimensions.innerHeight)
      .style('stroke', '#333')
      .style('stroke-width', 0.5)
      .style('opacity', 0.3);
  }
}

// Legend helpers
export interface LegendItem {
  label: string;
  color: string;
}

export function createLegend(
  container: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  items: LegendItem[],
  position: { x: number; y: number } = { x: 20, y: 20 }
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const legend = container
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${position.x}, ${position.y})`);

  const legendItems = legend
    .selectAll('.legend-item')
    .data(items)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

  legendItems
    .append('rect')
    .attr('width', 12)
    .attr('height', 12)
    .style('fill', (d) => d.color);

  legendItems
    .append('text')
    .attr('x', 18)
    .attr('y', 6)
    .attr('dy', '0.35em')
    .style('fill', '#00ff00')
    .style('font-family', 'monospace')
    .style('font-size', '12px')
    .text((d) => d.label);

  return legend;
}