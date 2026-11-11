export type ChartType = 'bar' | 'line' | 'area' | 'multi-bar';

export type MusicalScale = 'pentatonic' | 'major' | 'chromatic';

export type InstrumentTimbre = 'triangle' | 'sine' | 'marimba' | 'sawtooth-warm';

export type VisionMode =
  | 'normal'
  | 'deuteranopia'
  | 'protanopia'
  | 'tritanopia'
  | 'achromatopsia';

export type PatternId = 'diagonal-hatch' | 'cross-hatch' | 'dot-matrix' | 'vertical-bars';

export type MarkerShape = 'circle' | 'diamond' | 'square' | 'triangle';

export interface DataSeries {
  id: string;
  name: string;
  unit: string;
  color: string;
  highContrastColor: string;
  patternId: PatternId;
  markerShape: MarkerShape;
  timbre: InstrumentTimbre;
  values: number[];
}

export interface ChartDataset {
  id: string;
  title: string;
  subtitle: string;
  category: 'Climate' | 'Accessibility' | 'Public Health' | 'Clean Energy' | 'Education Equity';
  sourceName: string;
  sourceUrl: string;
  xAxisLabel: string;
  yAxisUnit: string;
  labels: string[];
  series: DataSeries[];
  rawCsv: string;
}

export interface PointAnomaly {
  index: number;
  label: string;
  value: number;
  zScore: number;
  type: 'max' | 'min' | 'outlier-high' | 'outlier-low';
}

export interface SeriesStats {
  seriesId: string;
  seriesName: string;
  unit: string;
  count: number;
  min: number;
  minIndex: number;
  minLabel: string;
  max: number;
  maxIndex: number;
  maxLabel: string;
  mean: number;
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  stdDev: number;
  slope: number;
  rSquared: number;
  percentChange: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  anomalies: PointAnomaly[];
}

export interface ChartStatisticalSummary {
  overallHeadline: string;
  w3cLongDescription: string;
  keyFindings: string[];
  seriesStats: SeriesStats[];
}

export interface AcousticPointTelemetry {
  pointIndex: number;
  totalPoints: number;
  label: string;
  seriesName: string;
  value: number;
  unit: string;
  frequencyHz: number;
  noteName: string;
  midiNote: number;
  stereoPan: number; // -1.0 (left) to +1.0 (right)
  panLabel: string;
  timbre: InstrumentTimbre;
  earconType: 'none' | 'peak' | 'trough' | 'outlier';
  screenReaderAnnouncement: string;
}

export interface ColorContrastAuditItem {
  seriesId: string;
  seriesName: string;
  foregroundHex: string;
  simulatedHex: string;
  backgroundHex: string;
  wcagRatio: number;
  wcagLevel: 'AAA' | 'AA' | 'AA-Large' | 'Fail';
  apcaLc: number;
  apcaPass: boolean;
  patternAssigned: PatternId;
}

export interface AccessibilityAuditReport {
  overallPass: boolean;
  score: number; // 0 - 100
  wcagContrastItems: ColorContrastAuditItem[];
  minPairwiseDeltaE: number;
  cvdSafe: boolean;
  tactilePatternsEnabled: boolean;
  screenReaderSummaryReady: boolean;
  keyboardNavigationReady: boolean;
  sonificationReady: boolean;
  checks: {
    id: string;
    criterion: string;
    standard: string;
    passed: boolean;
    detail: string;
  }[];
}

export interface ParseValidationError {
  line: number;
  column?: number;
  rawLine: string;
  message: string;
  suggestion: string;
}

export interface ParseResult {
  ok: boolean;
  dataset?: ChartDataset;
  errors: ParseValidationError[];
  cleanedCsvSuggestion?: string;
}
