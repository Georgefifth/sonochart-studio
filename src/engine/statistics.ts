import {
  ChartDataset,
  ChartStatisticalSummary,
  DataSeries,
  PointAnomaly,
  SeriesStats,
} from '../types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function computeSeriesStats(series: DataSeries, labels: string[]): SeriesStats {
  const vals = series.values;
  const n = vals.length;
  if (n === 0) {
    return {
      seriesId: series.id,
      seriesName: series.name,
      unit: series.unit,
      count: 0,
      min: 0,
      minIndex: 0,
      minLabel: '',
      max: 0,
      maxIndex: 0,
      maxLabel: '',
      mean: 0,
      median: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      stdDev: 0,
      slope: 0,
      rSquared: 0,
      percentChange: 0,
      trendDirection: 'stable',
      anomalies: [],
    };
  }

  let min = vals[0];
  let minIndex = 0;
  let max = vals[0];
  let maxIndex = 0;
  let sum = 0;

  for (let i = 0; i < n; i++) {
    const v = vals[i];
    sum += v;
    if (v < min) {
      min = v;
      minIndex = i;
    }
    if (v > max) {
      max = v;
      maxIndex = i;
    }
  }

  const mean = sum / n;
  const sorted = [...vals].sort((a, b) => a - b);
  const median = quantile(sorted, 0.5);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;

  let sqDiffSum = 0;
  for (let i = 0; i < n; i++) {
    sqDiffSum += Math.pow(vals[i] - mean, 2);
  }
  const stdDev = Math.sqrt(sqDiffSum / n);

  // Ordinary Least Squares linear regression against index 0..(n-1)
  const xMean = (n - 1) / 2;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (vals[i] - mean);
    den += Math.pow(i - xMean, 2);
  }
  const slope = den === 0 ? 0 : num / den;

  let ssRes = 0;
  const intercept = mean - slope * xMean;
  for (let i = 0; i < n; i++) {
    const pred = intercept + slope * i;
    ssRes += Math.pow(vals[i] - pred, 2);
  }
  const rSquared = sqDiffSum === 0 ? 1 : Math.max(0, 1 - ssRes / sqDiffSum);

  const first = vals[0];
  const last = vals[n - 1];
  const percentChange = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;

  const normalizedSlope = stdDev === 0 ? 0 : slope / stdDev;
  const trendDirection: 'rising' | 'falling' | 'stable' =
    normalizedSlope > 0.08 ? 'rising' : normalizedSlope < -0.08 ? 'falling' : 'stable';

  const anomalies: PointAnomaly[] = [];
  for (let i = 0; i < n; i++) {
    const v = vals[i];
    const z = stdDev === 0 ? 0 : (v - mean) / stdDev;
    if (i === maxIndex) {
      anomalies.push({
        index: i,
        label: labels[i] || String(i + 1),
        value: v,
        zScore: round2(z),
        type: 'max',
      });
    } else if (i === minIndex) {
      anomalies.push({
        index: i,
        label: labels[i] || String(i + 1),
        value: v,
        zScore: round2(z),
        type: 'min',
      });
    } else if (z >= 1.65) {
      anomalies.push({
        index: i,
        label: labels[i] || String(i + 1),
        value: v,
        zScore: round2(z),
        type: 'outlier-high',
      });
    } else if (z <= -1.65) {
      anomalies.push({
        index: i,
        label: labels[i] || String(i + 1),
        value: v,
        zScore: round2(z),
        type: 'outlier-low',
      });
    }
  }

  return {
    seriesId: series.id,
    seriesName: series.name,
    unit: series.unit,
    count: n,
    min: round2(min),
    minIndex,
    minLabel: labels[minIndex] || String(minIndex + 1),
    max: round2(max),
    maxIndex,
    maxLabel: labels[maxIndex] || String(maxIndex + 1),
    mean: round2(mean),
    median: round2(median),
    q1: round2(q1),
    q3: round2(q3),
    iqr: round2(iqr),
    stdDev: round2(stdDev),
    slope: round2(slope),
    rSquared: round2(rSquared),
    percentChange: round2(percentChange),
    trendDirection,
    anomalies,
  };
}

export function generateChartSummary(dataset: ChartDataset): ChartStatisticalSummary {
  const seriesStats = dataset.series.map((s) => computeSeriesStats(s, dataset.labels));
  const primary = seriesStats[0];

  if (!primary || primary.count === 0) {
    return {
      overallHeadline: 'Empty chart dataset.',
      w3cLongDescription: 'No data points loaded.',
      keyFindings: [],
      seriesStats: [],
    };
  }

  const unitSuffix = primary.unit ? ` ${primary.unit}` : '';
  const dirWord =
    primary.trendDirection === 'rising'
      ? 'an upward trend'
      : primary.trendDirection === 'falling'
      ? 'a downward trend'
      : 'a stable profile';

  const changeSign = primary.percentChange >= 0 ? `+${primary.percentChange}%` : `${primary.percentChange}%`;

  const overallHeadline = `${dataset.title}: ${primary.seriesName} shows ${dirWord} (${changeSign} overall, R²=${primary.rSquared}) across ${primary.count} ${dataset.xAxisLabel} intervals, peaking at ${primary.max}${unitSuffix} in ${primary.maxLabel}.`;

  const keyFindings: string[] = seriesStats.map((st) => {
    const u = st.unit ? ` ${st.unit}` : '';
    const chg = st.percentChange >= 0 ? `+${st.percentChange}%` : `${st.percentChange}%`;
    return `${st.seriesName}: Ranges from ${st.min}${u} (${st.minLabel}) to ${st.max}${u} (${st.maxLabel}), mean ${st.mean}${u}, IQR ${st.iqr}${u}, net change ${chg} (${st.trendDirection}, slope ${st.slope >= 0 ? '+' : ''}${st.slope}${u}/step).`;
  });

  const w3cLongDescription = [
    `Accessible W3C WAI Complex Image Description for "${dataset.title}".`,
    `X-axis represents ${dataset.xAxisLabel} from ${dataset.labels[0]} to ${dataset.labels[dataset.labels.length - 1]} (${dataset.labels.length} data points).`,
    ...keyFindings,
    `Use Left and Right Arrow keys to step through individual points with spatial stereo audio pitch and contextual screen-reader readout, or press P to play the full sonification timeline.`,
  ].join(' ');

  return {
    overallHeadline,
    w3cLongDescription,
    keyFindings,
    seriesStats,
  };
}
