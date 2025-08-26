import * as d3 from 'd3';

// Bloomberg Terminal Color Palette
export const bloombergColors = {
  // Primary colors
  primary: '#00ff00',      // Terminal green
  secondary: '#ffff00',    // Terminal yellow
  accent: '#00ffff',       // Terminal cyan
  warning: '#ff8800',      // Terminal orange
  danger: '#ff0000',       // Terminal red
  
  // Background colors
  background: '#000000',   // Terminal black
  surface: '#1a1a1a',     // Dark gray
  
  // Text colors
  text: '#00ff00',         // Primary green
  textSecondary: '#cccccc', // Light gray
  textMuted: '#666666',    // Medium gray
  
  // Chart specific colors
  grid: '#333333',         // Grid lines
  axis: '#00ff00',         // Axis lines
  tooltip: '#000000',      // Tooltip background
};

// Extended color palette for data visualization
export const dataColors = {
  // Categorical colors (for different categories/sectors)
  categorical: [
    '#00ff00', // Green
    '#ffff00', // Yellow
    '#00ffff', // Cyan
    '#ff8800', // Orange
    '#ff0000', // Red
    '#ff00ff', // Magenta
    '#8800ff', // Purple
    '#0088ff', // Blue
    '#88ff00', // Lime
    '#ff0088', // Pink
  ],
  
  // Sequential colors (for intensity/magnitude)
  sequential: {
    green: ['#003300', '#006600', '#009900', '#00cc00', '#00ff00'],
    red: ['#330000', '#660000', '#990000', '#cc0000', '#ff0000'],
    yellow: ['#333300', '#666600', '#999900', '#cccc00', '#ffff00'],
    cyan: ['#003333', '#006666', '#009999', '#00cccc', '#00ffff'],
  },
  
  // Diverging colors (for positive/negative values)
  diverging: {
    redGreen: ['#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffff00', '#ccff00', '#88ff00', '#44ff00', '#00ff00'],
    redCyan: ['#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc', '#ccffff', '#99ffff', '#66ffff', '#33ffff', '#00ffff'],
  },
};

// D3 Color Scales

// Categorical color scale
export function createCategoricalScale(domain: string[]): d3.ScaleOrdinal<string, string> {
  return d3.scaleOrdinal<string, string>()
    .domain(domain)
    .range(dataColors.categorical);
}

// Sequential color scale for corruption intensity
export function createCorruptionIntensityScale(
  domain: [number, number],
  colorScheme: 'green' | 'red' | 'yellow' | 'cyan' = 'red'
): d3.ScaleSequential<string> {
  return d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateRgbBasis(dataColors.sequential[colorScheme]));
}

// Linear color scale for continuous data
export function createLinearColorScale(
  domain: [number, number],
  range: [string, string] = [bloombergColors.background, bloombergColors.primary]
): d3.ScaleLinear<string, string> {
  return d3.scaleLinear<string, string>()
    .domain(domain)
    .range(range);
}

// Threshold color scale for discrete ranges
export function createThresholdColorScale(
  thresholds: number[],
  colors: string[] = dataColors.sequential.red
): d3.ScaleThreshold<number, string> {
  return d3.scaleThreshold<number, string>()
    .domain(thresholds)
    .range(colors);
}

// Diverging color scale for positive/negative values
export function createDivergingScale(
  domain: [number, number, number], // [min, center, max]
  colorScheme: 'redGreen' | 'redCyan' = 'redGreen'
): d3.ScaleDiverging<string> {
  return d3.scaleDiverging<string>()
    .domain(domain)
    .interpolator(d3.interpolateRgbBasis(dataColors.diverging[colorScheme]) as (t: number) => string);
}

// Sector-specific color mapping
export const sectorColors: Record<string, string> = {
  'Government': '#00ff00',     // Green
  'Education': '#ffff00',     // Yellow
  'Healthcare': '#00ffff',    // Cyan
  'Infrastructure': '#ff8800', // Orange
  'Finance': '#ff0000',       // Red
  'Energy': '#ff00ff',        // Magenta
  'Transportation': '#8800ff', // Purple
  'Agriculture': '#88ff00',   // Lime
  'Technology': '#0088ff',    // Blue
  'Defense': '#ff0088',       // Pink
  'Other': '#cccccc',         // Gray
};

// Region-specific color mapping for Indonesian provinces
export const regionColors: Record<string, string> = {
  // Java
  'DKI Jakarta': '#00ff00',
  'Jawa Barat': '#33ff33',
  'Jawa Tengah': '#66ff66',
  'Jawa Timur': '#99ff99',
  'Yogyakarta': '#ccffcc',
  'Banten': '#00cc00',
  
  // Sumatra
  'Sumatera Utara': '#ffff00',
  'Sumatera Barat': '#ffff33',
  'Sumatera Selatan': '#ffff66',
  'Riau': '#ffff99',
  'Jambi': '#ffffcc',
  'Bengkulu': '#cccc00',
  'Lampung': '#999900',
  'Aceh': '#666600',
  'Kepulauan Riau': '#333300',
  'Kepulauan Bangka Belitung': '#ffcc00',
  
  // Kalimantan
  'Kalimantan Timur': '#00ffff',
  'Kalimantan Selatan': '#33ffff',
  'Kalimantan Tengah': '#66ffff',
  'Kalimantan Barat': '#99ffff',
  'Kalimantan Utara': '#ccffff',
  
  // Sulawesi
  'Sulawesi Selatan': '#ff8800',
  'Sulawesi Tengah': '#ff9933',
  'Sulawesi Utara': '#ffaa66',
  'Sulawesi Tenggara': '#ffbb99',
  'Sulawesi Barat': '#ffcccc',
  'Gorontalo': '#cc6600',
  
  // Eastern Indonesia
  'Bali': '#ff00ff',
  'Nusa Tenggara Barat': '#ff33ff',
  'Nusa Tenggara Timur': '#ff66ff',
  'Maluku': '#ff99ff',
  'Maluku Utara': '#ffccff',
  'Papua': '#cc00cc',
  'Papua Barat': '#990099',
  'Papua Selatan': '#660066',
  'Papua Tengah': '#330033',
  'Papua Pegunungan': '#cc33cc',
  'Papua Barat Daya': '#993399',
};

// Corruption type color mapping
export const corruptionTypeColors: Record<string, string> = {
  'Embezzlement': '#ff0000',      // Red
  'Bribery': '#ff8800',           // Orange
  'Fraud': '#ffff00',             // Yellow
  'Money Laundering': '#00ff00',  // Green
  'Abuse of Power': '#00ffff',    // Cyan
  'Nepotism': '#0088ff',          // Blue
  'Kickbacks': '#8800ff',         // Purple
  'Extortion': '#ff00ff',         // Magenta
  'Conflict of Interest': '#88ff00', // Lime
  'Other': '#cccccc',             // Gray
};

// Severity level color mapping
export const severityColors: Record<string, string> = {
  'Low': '#00ff00',      // Green
  'Medium': '#ffff00',   // Yellow
  'High': '#ff8800',     // Orange
  'Critical': '#ff0000', // Red
};

// Helper function to get color by sector
export function getSectorColor(sector: string): string {
  return sectorColors[sector] || sectorColors['Other'];
}

// Helper function to get color by region
export function getRegionColor(region: string): string {
  return regionColors[region] || bloombergColors.textMuted;
}

// Helper function to get color by corruption type
export function getCorruptionTypeColor(type: string): string {
  return corruptionTypeColors[type] || corruptionTypeColors['Other'];
}

// Helper function to get color by severity
export function getSeverityColor(severity: string): string {
  return severityColors[severity] || severityColors['Low'];
}

// Helper function to create opacity variants
export function withOpacity(color: string, opacity: number): string {
  const d3Color = d3.color(color);
  if (d3Color) {
    d3Color.opacity = opacity;
    return d3Color.toString();
  }
  return color;
}

// Helper function to create darker variants
export function darken(color: string, factor: number = 0.2): string {
  const d3Color = d3.color(color);
  if (d3Color) {
    return d3Color.darker(factor).toString();
  }
  return color;
}

// Helper function to create brighter variants
export function brighten(color: string, factor: number = 0.2): string {
  const d3Color = d3.color(color);
  if (d3Color) {
    return d3Color.brighter(factor).toString();
  }
  return color;
}

// CSS Custom Properties for consistent theming
export const cssVariables = {
  '--color-primary': bloombergColors.primary,
  '--color-secondary': bloombergColors.secondary,
  '--color-accent': bloombergColors.accent,
  '--color-warning': bloombergColors.warning,
  '--color-danger': bloombergColors.danger,
  '--color-background': bloombergColors.background,
  '--color-surface': bloombergColors.surface,
  '--color-text': bloombergColors.text,
  '--color-text-secondary': bloombergColors.textSecondary,
  '--color-text-muted': bloombergColors.textMuted,
  '--color-grid': bloombergColors.grid,
  '--color-axis': bloombergColors.axis,
  '--color-tooltip': bloombergColors.tooltip,
};

// Function to apply CSS variables to document
export function applyCSSVariables(): void {
  const root = document.documentElement;
  Object.entries(cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}