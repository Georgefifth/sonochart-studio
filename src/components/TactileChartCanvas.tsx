import React from 'react';
import {
  ChartDataset,
  ChartType,
  MarkerShape,
  PatternId,
  VisionMode,
} from '../types';
import { simulateColorVision } from '../engine/colorAccessibility';

interface TactileChartCanvasProps {
  dataset: ChartDataset;
  chartType: ChartType;
  visionMode: VisionMode;
  highContrast: boolean;
  tactilePatternsEnabled: boolean;
  activePointIndex: number;
  activeSeriesIndex: number;
  onSelectPoint: (pointIndex: number, seriesIndex?: number) => void;
  svgRef?: React.RefObject<SVGSVGElement>;
}

function renderMarker(
  shape: MarkerShape,
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke: string,
  isActive: boolean
) {
  const strokeWidth = isActive ? 3 : 2;
  const size = isActive ? r * 1.35 : r;

  if (shape === 'diamond') {
    const pts = `${cx},${cy - size * 1.25} ${cx + size * 1.25},${cy} ${cx},${cy + size * 1.25} ${cx - size * 1.25},${cy}`;
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
  }
  if (shape === 'square') {
    return (
      <rect
        x={cx - size}
        y={cy - size}
        width={size * 2}
        height={size * 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }
  if (shape === 'triangle') {
    const pts = `${cx},${cy - size * 1.3} ${cx + size * 1.2},${cy + size} ${cx - size * 1.2},${cy + size}`;
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
  }
  return <circle cx={cx} cy={cy} r={size} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}

function renderPatternDef(id: string, patternType: PatternId, colorHex: string, bgHex: string) {
  if (patternType === 'diagonal-hatch') {
    return (
      <pattern
        key={id}
        id={id}
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="10" height="10" fill={colorHex} fillOpacity="0.22" />
        <line x1="0" y1="0" x2="0" y2="10" stroke={colorHex} strokeWidth="4.5" />
      </pattern>
    );
  }
  if (patternType === 'cross-hatch') {
    return (
      <pattern key={id} id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill={bgHex} />
        <path
          d="M 0,0 L 10,10 M 10,0 L 0,10"
          stroke={colorHex}
          strokeWidth="2.4"
        />
      </pattern>
    );
  }
  if (patternType === 'dot-matrix') {
    return (
      <pattern key={id} id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill={colorHex} fillOpacity="0.18" />
        <circle cx="3" cy="3" r="2.2" fill={colorHex} />
        <circle cx="8" cy="8" r="2.2" fill={colorHex} />
      </pattern>
    );
  }
  // vertical-bars
  return (
    <pattern key={id} id={id} width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill={colorHex} fillOpacity="0.18" />
      <line x1="2" y1="0" x2="2" y2="8" stroke={colorHex} strokeWidth="3" />
    </pattern>
  );
}

function formatCompactTick(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1e9) return `${(val / 1e9).toFixed(2).replace(/\.00$/, '')}B`;
  if (abs >= 1e6) return `${(val / 1e6).toFixed(2).replace(/\.00$/, '')}M`;
  if (abs >= 1e4) return `${(val / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(val * 100) / 100);
}

export const TactileChartCanvas: React.FC<TactileChartCanvasProps> = ({
  dataset,
  chartType,
  visionMode,
  highContrast,
  tactilePatternsEnabled,
  activePointIndex,
  activeSeriesIndex,
  onSelectPoint,
  svgRef,
}) => {
  const width = 820;
  const height = 376;
  const padLeft = 84;
  const padRight = 28;
  const padTop = 36;
  const padBottom = 68;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const bgHex = highContrast ? '#0A0A0A' : '#FFFFFF';
  const gridHex = highContrast ? '#333333' : '#DCD7CA';
  const axisHex = highContrast ? '#FFFFFF' : '#141413';
  const playheadHex = highContrast ? '#00FF66' : '#C83E00';

  const allValues = dataset.series.flatMap((s) => s.values);
  const rawMin = Math.min(...allValues, 0);
  const rawMax = Math.max(...allValues, 1);
  const yMin = rawMin < 0 ? Math.floor(rawMin * 1.1) : 0;
  const yMax = rawMax === yMin ? yMin + 10 : rawMax * 1.08;

  const numPoints = dataset.labels.length;
  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((yMin + ((yMax - yMin) * i) / yTicks) * 100) / 100
  );

  const getY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin || 1);
    return padTop + plotH - ratio * plotH;
  };

  const stepW = plotW / Math.max(1, numPoints);
  const getCenterX = (idx: number) => padLeft + idx * stepW + stepW / 2;

  const resolvedSeriesColors = dataset.series.map((s) => {
    const base = highContrast ? s.highContrastColor : s.color;
    return simulateColorVision(base, visionMode);
  });

  const activeX = getCenterX(activePointIndex);

  return (
    <div className="chart-stage-wrapper">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="tactile-chart-svg"
        role="img"
        aria-label={`${dataset.title}. ${dataset.subtitle}. Interactive tactile and sonified chart with ${numPoints} points across ${dataset.series.length} series.`}
      >
        <title>{dataset.title}</title>
        <desc>{dataset.subtitle}</desc>

        <defs>
          {dataset.series.map((s, idx) =>
            renderPatternDef(
              `pattern-${s.id}`,
              s.patternId,
              resolvedSeriesColors[idx],
              bgHex
            )
          )}
        </defs>

        {/* Stage background */}
        <rect x="0" y="0" width={width} height={height} fill={bgHex} rx="4" />

        {/* Horizontal grid lines & Y-axis labels */}
        {tickValues.map((tv, idx) => {
          const y = getY(tv);
          return (
            <g key={`ytick-${idx}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke={gridHex}
                strokeDasharray={idx === 0 ? undefined : '4 4'}
                strokeWidth={idx === 0 ? 1.75 : 1}
              />
              <text
                x={padLeft - 10}
                y={y + 4}
                textAnchor="end"
                fill={axisHex}
                fontSize="11.5"
                fontFamily="IBM Plex Mono, monospace"
              >
                {formatCompactTick(tv)}
                {dataset.yAxisUnit && idx === tickValues.length - 1 ? ` ${dataset.yAxisUnit}` : ''}
              </text>
            </g>
          );
        })}

        {/* Active Playhead Vertical Guide */}
        {numPoints > 0 && (
          <g className="playhead-guide">
            <rect
              x={padLeft + activePointIndex * stepW + 2}
              y={padTop}
              width={Math.max(4, stepW - 4)}
              height={plotH}
              fill={playheadHex}
              fillOpacity={highContrast ? 0.14 : 0.08}
            />
            <line
              x1={activeX}
              y1={padTop - 8}
              x2={activeX}
              y2={padTop + plotH}
              stroke={playheadHex}
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <rect
              x={activeX - 38}
              y={6}
              width="76"
              height="20"
              rx="3"
              fill={playheadHex}
            />
            <text
              x={activeX}
              y={20}
              textAnchor="middle"
              fill={highContrast ? '#0A0A0A' : '#FFFFFF'}
              fontSize="11"
              fontWeight="700"
              fontFamily="IBM Plex Mono, monospace"
            >
              PT {activePointIndex + 1}/{numPoints}
            </text>
          </g>
        )}

        {/* Bar / Multi-Bar Rendering */}
        {(chartType === 'bar' || chartType === 'multi-bar') &&
          dataset.labels.map((label, pIdx) => {
            const seriesList =
              chartType === 'bar' ? [dataset.series[0]] : dataset.series;
            const groupW = stepW * 0.74;
            const barW = groupW / seriesList.length;
            const groupStartX = getCenterX(pIdx) - groupW / 2;

            return (
              <g key={`bargroup-${pIdx}`}>
                {seriesList.map((s, sIdx) => {
                  const val = s.values[pIdx] ?? 0;
                  const yTop = getY(Math.max(0, val));
                  const yZero = getY(0);
                  const barH = Math.max(3, Math.abs(yZero - yTop));
                  const barX = groupStartX + sIdx * barW + 1.5;
                  const colorHex = resolvedSeriesColors[sIdx];
                  const fillRef = tactilePatternsEnabled
                    ? `url(#pattern-${s.id})`
                    : colorHex;
                  const isActive =
                    pIdx === activePointIndex &&
                    (chartType === 'bar' || sIdx === activeSeriesIndex);

                  return (
                    <g
                      key={`bar-${s.id}-${pIdx}`}
                      className="chart-interactive-mark"
                      onClick={() => onSelectPoint(pIdx, sIdx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={barX}
                        y={Math.min(yTop, yZero)}
                        width={Math.max(4, barW - 3)}
                        height={barH}
                        fill={fillRef}
                        stroke={isActive ? playheadHex : colorHex}
                        strokeWidth={isActive ? 3 : 2}
                        rx="2"
                      />
                      {/* Top cap marker for extra tactile/visual clarity */}
                      {isActive && (
                        <circle
                          cx={barX + (barW - 3) / 2}
                          cy={Math.min(yTop, yZero) - 7}
                          r={4}
                          fill={playheadHex}
                        />
                      )}
                      <title>{`${label} — ${s.name}: ${val} ${s.unit}`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}

        {/* Area & Line Chart Rendering */}
        {(chartType === 'line' || chartType === 'area') &&
          dataset.series.map((s, sIdx) => {
            const colorHex = resolvedSeriesColors[sIdx];
            const pts = s.values.map((v, idx) => ({
              x: getCenterX(idx),
              y: getY(v),
              v,
            }));
            const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');
            const areaPath =
              pts.length > 1
                ? `M ${pts[0].x},${getY(yMin)} L ` +
                  pts.map((p) => `${p.x},${p.y}`).join(' L ') +
                  ` L ${pts[pts.length - 1].x},${getY(yMin)} Z`
                : '';

            return (
              <g key={`lineseries-${s.id}`}>
                {chartType === 'area' && areaPath && (
                  <path
                    d={areaPath}
                    fill={
                      tactilePatternsEnabled
                        ? `url(#pattern-${s.id})`
                        : colorHex
                    }
                    fillOpacity={tactilePatternsEnabled ? 0.85 : 0.2}
                    stroke="none"
                  />
                )}
                <polyline
                  fill="none"
                  stroke={colorHex}
                  strokeWidth={sIdx === activeSeriesIndex ? 3.5 : 2.5}
                  strokeDasharray={sIdx === 1 ? '7 4' : sIdx === 2 ? '2 4' : undefined}
                  points={polylinePoints}
                />
                {pts.map((p, pIdx) => {
                  const isActive =
                    pIdx === activePointIndex && sIdx === activeSeriesIndex;
                  return (
                    <g
                      key={`node-${s.id}-${pIdx}`}
                      onClick={() => onSelectPoint(pIdx, sIdx)}
                      style={{ cursor: 'pointer' }}
                    >
                      {renderMarker(
                        s.markerShape,
                        p.x,
                        p.y,
                        isActive ? 7 : 5.5,
                        isActive ? playheadHex : bgHex,
                        colorHex,
                        isActive
                      )}
                      <title>{`${dataset.labels[pIdx]} — ${s.name}: ${p.v} ${s.unit}`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}

        {/* X-Axis Baseline & Labels */}
        <line
          x1={padLeft}
          y1={padTop + plotH}
          x2={width - padRight}
          y2={padTop + plotH}
          stroke={axisHex}
          strokeWidth="2"
        />
        {dataset.labels.map((lbl, idx) => {
          const cx = getCenterX(idx);
          const isCurrent = idx === activePointIndex;
          const maxLabelLen = Math.max(...dataset.labels.map((l) => l.length));
          const stride =
            numPoints > 18 ? 3 : numPoints > 11 && maxLabelLen > 5 ? 2 : 1;
          const showText =
            isCurrent ||
            stride === 1 ||
            idx % stride === 0 ||
            idx === numPoints - 1;
          const maxChars = stride > 1 ? 10 : numPoints > 10 ? 7 : 12;
          const shortLbl =
            lbl.length > maxChars ? lbl.slice(0, maxChars - 1) + '…' : lbl;
          return (
            <g
              key={`xlabel-${idx}`}
              onClick={() => onSelectPoint(idx, activeSeriesIndex)}
              style={{ cursor: 'pointer' }}
            >
              <line
                x1={cx}
                y1={padTop + plotH}
                x2={cx}
                y2={padTop + plotH + 6}
                stroke={axisHex}
                strokeWidth="1.5"
              />
              {showText && (
                <text
                  x={cx}
                  y={padTop + plotH + 22}
                  textAnchor="middle"
                  fill={isCurrent ? playheadHex : axisHex}
                  fontSize="11"
                  fontWeight={isCurrent ? '700' : '500'}
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {shortLbl}
                </text>
              )}
            </g>
          );
        })}

        {/* Embedded Legend Strip inside SVG so standalone SVG export is self-explanatory */}
        <g transform={`translate(${padLeft}, ${height - 18})`}>
          {dataset.series.map((s, idx) => {
            const legendSlotW = Math.min(
              320,
              Math.floor(plotW / Math.max(1, dataset.series.length))
            );
            const offsetX = idx * legendSlotW;
            const colorHex = resolvedSeriesColors[idx];
            const rawLegendText = `${s.name} (${s.unit || 'val'}) — ${s.patternId}`;
            const maxLegendChars = Math.max(18, Math.floor(legendSlotW / 7.2));
            const legendText =
              rawLegendText.length > maxLegendChars
                ? rawLegendText.slice(0, maxLegendChars - 1) + '…'
                : rawLegendText;
            return (
              <g
                key={`legend-${s.id}`}
                transform={`translate(${offsetX}, 0)`}
                onClick={() => onSelectPoint(activePointIndex, idx)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="0"
                  y="-11"
                  width="18"
                  height="12"
                  fill={
                    tactilePatternsEnabled ? `url(#pattern-${s.id})` : colorHex
                  }
                  stroke={colorHex}
                  strokeWidth="2"
                />
                <text
                  x="24"
                  y="-1"
                  fill={axisHex}
                  fontSize="11.5"
                  fontWeight={idx === activeSeriesIndex ? '700' : '500'}
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {legendText}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
