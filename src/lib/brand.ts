// The CHANWE palette for code that cannot read CSS variables: Chart.js
// canvases, SVG strokes, meta tags. tokens.json is a byte-for-byte copy of
// chanwe-ui brand/tokens/tokens.json (brand-sync keeps it current); never
// write a hex value here, map a token name instead.
import tokens from '@/brand/tokens.json';

export const BRAND = tokens.color.palette;

// Series order: the orange first, then slate, then the brand chart hues.
// No ink: an ink series disappears on the dark theme's ink background.
export const BRAND_CHART_COLORS = [
  BRAND.primary,
  BRAND['body-fg'],
  BRAND['chart-blue'],
  BRAND['chart-teal'],
  BRAND['chart-indigo'],
  BRAND['chart-green'],
  BRAND['chart-orange'],
  BRAND['chart-purple'],
  BRAND['chart-red'],
  BRAND['fg-subtle'],
  BRAND['chart-gray'],
  BRAND['rule-cool'],
];
