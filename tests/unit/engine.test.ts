import { describe, expect, it } from 'vitest';
import { INVALID_SAMPLE_CSV, PRESET_DATASETS } from '../../src/data/presets';
import { parseDatasetInput } from '../../src/engine/dataParser';
import { computeSeriesStats, generateChartSummary } from '../../src/engine/statistics';
import {
  auditChartAccessibility,
  computeApcaLc,
  computeDeltaE,
  computeWcagContrast,
  simulateColorVision,
} from '../../src/engine/colorAccessibility';
import {
  computePointTelemetry,
  synthesizeDatasetWavBytes,
  valueToScaleNote,
} from '../../src/engine/sonifier';
import { generateStandaloneAccessibleHtml } from '../../src/engine/exporter';

describe('SonoChart Studio Deterministic Engine Suite', () => {
  it('parses valid CSV and JSON datasets accurately', () => {
    const resCsv = parseDatasetInput(PRESET_DATASETS[0].rawCsv, {
      title: 'Renewable Test',
    });
    expect(resCsv.ok).toBe(true);
    expect(resCsv.dataset?.labels.length).toBe(11);
    expect(resCsv.dataset?.series.length).toBe(2);
    expect(resCsv.dataset?.series[0].unit).toBe('GW');

    const jsonInput = JSON.stringify([
      { Year: '2023', 'Solar (GW)': 1419, 'Wind (GW)': 1017 },
      { Year: '2024', 'Solar (GW)': 1865, 'Wind (GW)': 1132 },
    ]);
    const resJson = parseDatasetInput(jsonInput);
    expect(resJson.ok).toBe(true);
    expect(resJson.dataset?.labels).toEqual(['2023', '2024']);
    expect(resJson.dataset?.series[0].values).toEqual([1419, 1865]);
  });

  it('catches malformed CSV rows with exact line/column numbers and offers auto-clean suggestion', () => {
    const badRes = parseDatasetInput(INVALID_SAMPLE_CSV);
    expect(badRes.ok).toBe(false);
    expect(badRes.errors.length).toBe(2);
    expect(badRes.errors[0].line).toBe(4);
    expect(badRes.errors[0].column).toBe(2);
    expect(badRes.cleanedCsvSuggestion).toBeDefined();

    const cleanedRes = parseDatasetInput(badRes.cleanedCsvSuggestion!);
    expect(cleanedRes.ok).toBe(true);
    expect(cleanedRes.dataset?.labels.length).toBe(3);
  });

  it('computes linear regression slope, R², IQR, and W3C complex-image summary', () => {
    const preset = PRESET_DATASETS[0];
    const st = computeSeriesStats(preset.series[0], preset.labels);
    expect(st.min).toBe(228);
    expect(st.max).toBe(2290);
    expect(st.trendDirection).toBe('rising');
    expect(st.slope).toBeGreaterThan(150);
    expect(st.rSquared).toBeGreaterThan(0.85);

    const summary = generateChartSummary(preset);
    expect(summary.overallHeadline).toContain('Solar PV Capacity shows an upward trend');
    expect(summary.w3cLongDescription).toContain('Accessible W3C WAI Complex Image Description');
  });

  it('audits WCAG 2.2 contrast, APCA Lc, and Machado 2009 CVD color blindness simulation', () => {
    const wcag = computeWcagContrast('#0047AB', '#FFFFFF');
    expect(wcag).toBeGreaterThan(7.0); // AAA on white

    const apca = computeApcaLc('#0047AB', '#FFFFFF');
    expect(apca).toBeGreaterThan(75);

    const deut = simulateColorVision('#C83E00', 'deuteranopia');
    const cobaltDeut = simulateColorVision('#0047AB', 'deuteranopia');
    expect(computeDeltaE(deut, cobaltDeut)).toBeGreaterThan(25);

    const audit = auditChartAccessibility(PRESET_DATASETS[0], {
      visionMode: 'deuteranopia',
      highContrast: false,
      tactilePatternsEnabled: true,
    });
    expect(audit.overallPass).toBe(true);
    expect(audit.score).toBe(100);
  });

  it('maps values to musical scale notes, generates contextual ARIA readout, and synthesizes valid 16-bit PCM WAV bytes', () => {
    const note = valueToScaleNote(500, 0, 1000, 'pentatonic', 48);
    expect(note.midiNote).toBeGreaterThanOrEqual(48);
    expect(note.frequencyHz).toBeGreaterThan(130);

    const tel = computePointTelemetry(PRESET_DATASETS[0], 3, 0, 'pentatonic');
    expect(tel.screenReaderAnnouncement).toContain('Point 4 of 11');
    expect(tel.screenReaderAnnouncement).toContain('2018');
    expect(tel.screenReaderAnnouncement).toContain('Solar PV Capacity is 489 GW');

    const wavBytes = synthesizeDatasetWavBytes(PRESET_DATASETS[0], 'pentatonic', 0.1);
    expect(wavBytes.byteLength).toBeGreaterThan(44);
    const header = String.fromCharCode(wavBytes[0], wavBytes[1], wavBytes[2], wavBytes[3]);
    const format = String.fromCharCode(wavBytes[8], wavBytes[9], wavBytes[10], wavBytes[11]);
    expect(header).toBe('RIFF');
    expect(format).toBe('WAVE');
  });

  it('exports a self-contained WCAG 2.2 AA HTML widget with embedded SVG, ARIA live readout, and semantic data table', () => {
    const preset = PRESET_DATASETS[0];
    const summary = generateChartSummary(preset);
    const audit = auditChartAccessibility(preset, {
      visionMode: 'normal',
      highContrast: false,
      tactilePatternsEnabled: true,
    });
    const html = generateStandaloneAccessibleHtml({
      dataset: preset,
      summary,
      audit,
      chartType: 'multi-bar',
      scale: 'pentatonic',
      visionMode: 'normal',
      svgMarkup: '<svg id="mock-svg"></svg>',
    });
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Synchronized Accessible Data Table');
    expect(html).toContain('<svg id="mock-svg"></svg>');
  });
});
