import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseDatasetInput } from '../../src/engine/dataParser';
import { generateChartSummary } from '../../src/engine/statistics';
import { auditChartAccessibility } from '../../src/engine/colorAccessibility';
import { synthesizeDatasetWavBytes } from '../../src/engine/sonifier';

describe('Stage 3.5 Independent Hold-Out Validation Suite (5 Untouched Real-World Datasets)', () => {
  it('processes all 5 untouched holdout datasets from vega-datasets', () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.resolve('evidence/stage-3.5-validation/holdout-manifest.json'),
        'utf-8'
      )
    ) as { file: string; sourceUrl: string; sha256: string }[];

    const results = manifest.map((m) => {
      const raw = fs.readFileSync(
        path.resolve('evidence/stage-3.5-validation/datasets', m.file),
        'utf-8'
      );
      const t0 = performance.now();
      let parsed = parseDatasetInput(raw, { title: m.file });
      let usedAutoClean = false;
      if (!parsed.ok && parsed.cleanedCsvSuggestion) {
        parsed = parseDatasetInput(parsed.cleanedCsvSuggestion, {
          title: `${m.file} (Auto-Cleaned)`,
        });
        usedAutoClean = true;
      }
      if (!parsed.ok || !parsed.dataset) {
        return {
          file: m.file,
          sourceUrl: m.sourceUrl,
          sha256: m.sha256,
          passed: false,
          usedAutoClean,
          error: parsed.errors[0]?.message || 'Failed to parse',
        };
      }
      const summary = generateChartSummary(parsed.dataset);
      const audit = auditChartAccessibility(parsed.dataset, {
        visionMode: 'deuteranopia',
        highContrast: false,
        tactilePatternsEnabled: true,
      });
      const wav = synthesizeDatasetWavBytes(parsed.dataset, 'pentatonic', 0.1);
      return {
        file: m.file,
        sourceUrl: m.sourceUrl,
        sha256: m.sha256,
        passed: audit.overallPass && wav.byteLength > 44 && summary.seriesStats.length > 0,
        usedAutoClean,
        elapsedMs: Math.round((performance.now() - t0) * 100) / 100,
        rows: parsed.dataset.labels.length,
        seriesCount: parsed.dataset.series.length,
        seriesNames: parsed.dataset.series.map((s) => s.name),
        primaryHeadline: summary.overallHeadline,
        wcagScore: audit.score,
        wavBytes: wav.byteLength,
      };
    });

    fs.writeFileSync(
      path.resolve('evidence/stage-3.5-validation/holdout-results.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalHoldoutCases: results.length,
          passedHoldoutCases: results.filter((r) => r.passed).length,
          results,
        },
        null,
        2
      )
    );

    for (const r of results) {
      console.log(
        `${r.passed ? 'PASS' : 'FAIL'} [Holdout] ${r.file} -> rows=${r.rows}, series=${r.seriesCount}`
      );
    }
    expect(results.every((r) => r.passed)).toBe(true);
  });
});
