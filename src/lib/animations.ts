import * as d3 from 'd3';

// Type interfaces for animation data
interface BarData {
  value: number;
  [key: string]: unknown;
}

interface NodeData {
  radius?: number;
  [key: string]: unknown;
}

interface TreemapData {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  [key: string]: unknown;
}

// Animation duration constants
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 500,
  SLOW: 1000,
  VERY_SLOW: 2000,
} as const;

// Easing functions
export const EASING = {
  LINEAR: d3.easeLinear,
  QUAD_IN: d3.easeQuadIn,
  QUAD_OUT: d3.easeQuadOut,
  QUAD_IN_OUT: d3.easeQuadInOut,
  CUBIC_IN: d3.easeCubicIn,
  CUBIC_OUT: d3.easeCubicOut,
  CUBIC_IN_OUT: d3.easeCubicInOut,
  BOUNCE_OUT: d3.easeBounceOut,
  ELASTIC_OUT: d3.easeElasticOut,
  BACK_OUT: d3.easeBackOut,
} as const;

// Animation configuration interface
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: (t: number) => number;
}

// Default animation configuration
export const defaultAnimationConfig: AnimationConfig = {
  duration: ANIMATION_DURATION.NORMAL,
  delay: 0,
  ease: EASING.CUBIC_OUT,
};

// Fade in animation
export function fadeIn<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('opacity', 1);
}

// Fade out animation
export function fadeOut<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('opacity', 0);
}

// Slide in from left animation
export function slideInFromLeft<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  distance: number = 100,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .style('transform', `translateX(-${distance}px)`)
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('transform', 'translateX(0px)')
    .style('opacity', 1);
}

// Slide in from right animation
export function slideInFromRight<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  distance: number = 100,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .style('transform', `translateX(${distance}px)`)
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('transform', 'translateX(0px)')
    .style('opacity', 1);
}

// Slide in from top animation
export function slideInFromTop<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  distance: number = 100,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .style('transform', `translateY(-${distance}px)`)
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('transform', 'translateY(0px)')
    .style('opacity', 1);
}

// Slide in from bottom animation
export function slideInFromBottom<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  distance: number = 100,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .style('transform', `translateY(${distance}px)`)
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('transform', 'translateY(0px)')
    .style('opacity', 1);
}

// Scale in animation
export function scaleIn<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .style('transform', 'scale(0)')
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('transform', 'scale(1)')
    .style('opacity', 1);
}

// Scale out animation
export function scaleOut<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<T, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return selection
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .style('transform', 'scale(0)')
    .style('opacity', 0);
}

// Bar chart specific animations

// Animate bars growing from bottom
export function animateBarsFromBottom<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  bars: d3.Selection<SVGRectElement, Datum, PElement, PDatum>,
  yScale: d3.ScaleLinear<number, number>,
  height: number,
  config: AnimationConfig = {}
): d3.Transition<SVGRectElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return bars
    .attr('y', height)
    .attr('height', 0)
    .transition()
    .duration(duration!)
    .delay((d, i) => (delay! + i * 50))
    .ease(ease!)
    .attr('y', (d: Datum) => yScale((d as BarData).value))
    .attr('height', (d: Datum) => height - yScale((d as BarData).value));
}

// Animate bars growing from left
export function animateBarsFromLeft<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  bars: d3.Selection<SVGRectElement, Datum, PElement, PDatum>,
  xScale: d3.ScaleLinear<number, number>,
  config: AnimationConfig = {}
): d3.Transition<SVGRectElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return bars
    .attr('width', 0)
    .transition()
    .duration(duration!)
    .delay((d, i) => (delay! + i * 50))
    .ease(ease!)
    .attr('width', (d: Datum) => xScale((d as BarData).value));
}

// Line chart specific animations

// Animate line drawing
export function animateLineDraw<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  path: d3.Selection<SVGPathElement, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<SVGPathElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return path
    .each(function() {
      const totalLength = (this as SVGPathElement).getTotalLength();
      d3.select(this)
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength);
    })
    .transition()
    .duration(duration!)
    .delay(delay!)
    .ease(ease!)
    .attr('stroke-dashoffset', 0);
}

// Animate points appearing
export function animatePointsAppear<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  circles: d3.Selection<SVGCircleElement, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<SVGCircleElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return circles
    .attr('r', 0)
    .transition()
    .duration(duration!)
    .delay((d, i) => (delay! + i * 30))
    .ease(ease!)
    .attr('r', 4);
}

// Network graph specific animations

// Animate nodes appearing
export function animateNodesAppear<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  nodes: d3.Selection<SVGCircleElement, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<SVGCircleElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return nodes
    .attr('r', 0)
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay((d, i) => (delay! + i * 20))
    .ease(ease!)
    .attr('r', (d: Datum) => (d as NodeData).radius || 5)
    .style('opacity', 1);
}

// Animate links appearing
export function animateLinksAppear<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  links: d3.Selection<SVGLineElement, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<SVGLineElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return links
    .style('opacity', 0)
    .transition()
    .duration(duration!)
    .delay((d, i) => (delay! + i * 10))
    .ease(ease!)
    .style('opacity', 0.6);
}

// Treemap specific animations

// Animate rectangles growing
export function animateTreemapRects<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  rects: d3.Selection<SVGRectElement, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<SVGRectElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return rects
    .attr('width', 0)
    .attr('height', 0)
    .transition()
    .duration(duration!)
    .delay((d, i) => (delay! + i * 30))
    .ease(ease!)
    .attr('width', (d: Datum) => Math.max(0, (d as TreemapData).x1 - (d as TreemapData).x0))
    .attr('height', (d: Datum) => Math.max(0, (d as TreemapData).y1 - (d as TreemapData).y0));
}

// Choropleth map specific animations

// Animate map regions appearing
export function animateMapRegions<Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  paths: d3.Selection<SVGPathElement, Datum, PElement, PDatum>,
  config: AnimationConfig = {}
): d3.Transition<SVGPathElement, Datum, PElement, PDatum> {
  const { duration, delay, ease } = { ...defaultAnimationConfig, ...config };
  
  return paths
    .style('opacity', 0)
    .style('transform', 'scale(0.8)')
    .transition()
    .duration(duration!)
    .delay((d, i) => (delay! + i * 20))
    .ease(ease!)
    .style('opacity', 1)
    .style('transform', 'scale(1)');
}

// Generic transition helpers

// Staggered animation for multiple elements
export function staggeredAnimation<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  animationFn: (sel: d3.Selection<T, Datum, PElement, PDatum>, config: AnimationConfig) => d3.Transition<T, Datum, PElement, PDatum>,
  staggerDelay: number = 50,
  config: AnimationConfig = {}
): void {
  selection.each(function(d, i) {
    const element = d3.select(this) as d3.Selection<T, Datum, PElement, PDatum>;
    const staggeredConfig = {
      ...config,
      delay: (config.delay || 0) + i * staggerDelay,
    };
    animationFn(element, staggeredConfig);
  });
}

// Sequential animation chain
export function sequentialAnimation<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  animations: Array<{
    selection: d3.Selection<T, Datum, PElement, PDatum>;
    animationFn: (sel: d3.Selection<T, Datum, PElement, PDatum>, config: AnimationConfig) => d3.Transition<T, Datum, PElement, PDatum>;
    config?: AnimationConfig;
  }>
): Promise<void> {
  return animations.reduce((promise, { selection, animationFn, config = {} }) => {
    return promise.then(() => {
      return new Promise<void>((resolve) => {
        const transition = animationFn(selection, config);
        transition.on('end', () => resolve());
      });
    });
  }, Promise.resolve());
}

// Hover animations
export function createHoverAnimation<T extends d3.BaseType, Datum = unknown, PElement extends d3.BaseType = null, PDatum = undefined>(
  selection: d3.Selection<T, Datum, PElement, PDatum>,
  hoverConfig: {
    scale?: number;
    opacity?: number;
    duration?: number;
  } = {}
): void {
  const { scale = 1.1, opacity = 0.8, duration = ANIMATION_DURATION.FAST } = hoverConfig;
  
  selection
    .on('mouseenter', function() {
      d3.select(this)
        .transition()
        .duration(duration)
        .style('transform', `scale(${scale})`)
        .style('opacity', opacity);
    })
    .on('mouseleave', function() {
      d3.select(this)
        .transition()
        .duration(duration)
        .style('transform', 'scale(1)')
        .style('opacity', 1);
    });
}

// Loading animation
export function createLoadingAnimation(
  container: d3.Selection<HTMLElement, unknown, null, undefined>
): d3.Selection<HTMLDivElement, unknown, null, undefined> {
  const loading = container
    .append('div')
    .attr('class', 'loading-animation')
    .style('position', 'absolute')
    .style('top', '50%')
    .style('left', '50%')
    .style('transform', 'translate(-50%, -50%)')
    .style('color', '#00ff00')
    .style('font-family', 'monospace')
    .style('font-size', '14px')
    .text('Loading...');

  // Animate the loading text
  const animateLoading = () => {
    loading
      .transition()
      .duration(500)
      .style('opacity', 0.3)
      .transition()
      .duration(500)
      .style('opacity', 1)
      .on('end', animateLoading);
  };
  
  animateLoading();
  
  return loading;
}

// Remove loading animation
export function removeLoadingAnimation(
  loading: d3.Selection<HTMLDivElement, unknown, null, undefined>
): void {
  loading
    .transition()
    .duration(ANIMATION_DURATION.FAST)
    .style('opacity', 0)
    .remove();
}