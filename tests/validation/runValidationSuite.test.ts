import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseDatasetInput } from '../../src/engine/dataParser';
import { generateChartSummary } from '../../src/engine/statistics';
import { auditChartAccessibility } from '../../src/engine/colorAccessibility';
import {
  computePointTelemetry,
  synthesizeDatasetWavBytes,
} from '../../src/engine/sonifier';
import { generateStandaloneAccessibleHtml } from '../../src/engine/exporter';

interface ManifestItem {
  id: string;
  file: string;
  tier: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  sha256: string;
  downloadedAt: string;
  expectedValidDirect: boolean;
  expectedRowsAfterClean: number;
  expectedSeriesCount: number;
  groundTruthPrimaryMin: number;
  groundTruthPrimaryMax: number;
}

describe('Stage 3.5 Real-World Validation Suite', () => {
  it('evaluates all 12 real-world, edge, negative, and adversarial cases and records raw metrics', () => {
    const manifestPath = path.resolve(
      'evidence/stage-3.5-validation/dataset-manifest.json'
    );
    const manifest: ManifestItem[] = JSON.parse(
      fs.readFileSync(manifestPath, 'utf-8')
    );

    const outFile =
      process.env.VALIDATION_OUT_FILE ||
      'evidence/stage-3.5-validation/initial-results.json';

    const caseResults = manifest.map((item) => {
      const filePath = path.resolve(
        'evidence/stage-3.5-validation/datasets',
        item.file
      );
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const t0 = performance.now();

      const parseRes = parseDatasetInput(rawContent, {
        id: item.id,
        title: `${item.id} — ${item.sourceName}`,
      });

      let finalDataset = parseRes.dataset;
      let usedAutoClean = false;

      if (!parseRes.ok && parseRes.cleanedCsvSuggestion) {
        const cleanedRes = parseDatasetInput(parseRes.cleanedCsvSuggestion, {
          id: item.id,
          title: `${item.id} (Auto-Cleaned)`,
        });
        if (cleanedRes.ok && cleanedRes.dataset) {
          finalDataset = cleanedRes.dataset;
          usedAutoClean = true;
        }
      }

      // Negative cases (case10, case11): success means cleanly rejecting with ok=false and 0 exceptions
      if (item.tier === 'Negative Case') {
        const cleanRejection = !parseRes.ok && parseRes.errors.length > 0 && !finalDataset;
        return {
          id: item.id,
          file: item.file,
          tier: item.tier,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          directParseOk: parseRes.ok,
          usedAutoClean,
          passedValidation: cleanRejection,
          elapsedMs: Math.round((performance.now() - t0) * 100) / 100,
          failureReason: cleanRejection
            ? null
            : 'Negative case was not cleanly rejected',
          errorsReported: parseRes.errors.map((e) => e.message),
        };
      }

      if (!finalDataset) {
        return {
          id: item.id,
          file: item.file,
          tier: item.tier,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          directParseOk: parseRes.ok,
          usedAutoClean,
          passedValidation: false,
          elapsedMs: Math.round((performance.now() - t0) * 100) / 100,
          failureReason: `Parser rejected dataset (${parseRes.errors.length} errors): ${
            parseRes.errors[0]?.message || 'Unknown error'
          }`,
          errorsReported: parseRes.errors.slice(0, 3).map((e) => e.message),
        };
      }

      const summary = generateChartSummary(finalDataset);
      const audit = auditChartAccessibility(finalDataset, {
        visionMode: 'deuteranopia',
        highContrast: false,
        tactilePatternsEnabled: true,
      });
      const pt0 = computePointTelemetry(finalDataset, 0, 0, 'pentatonic');
      const wavBytes = synthesizeDatasetWavBytes(finalDataset, 'pentatonic', 0.12);
      const exportedHtml = generateStandaloneAccessibleHtml({
        dataset: finalDataset,
        summary,
        audit,
        chartType: 'multi-bar',
        scale: 'pentatonic',
        visionMode: 'normal',
        svgMarkup: '<svg></svg>',
      });

      const primaryStats = summary.seriesStats[0];
      const rowsMatch = finalDataset.labels.length === item.expectedRowsAfterClean;
      const seriesMatch = finalDataset.series.length === item.expectedSeriesCount;
      const minMatch =
        Math.abs(primaryStats.min - item.groundTruthPrimaryMin) <= 0.05;
      const maxMatch =
        Math.abs(primaryStats.max - item.groundTruthPrimaryMax) <= 0.05;
      const xssSafe = !exportedHtml.includes('<script>alert(');
      const wavValid =
        wavBytes.byteLength > 44 &&
        String.fromCharCode(wavBytes[0], wavBytes[1], wavBytes[2], wavBytes[3]) ===
          'RIFF';

      const passed =
        rowsMatch && seriesMatch && minMatch && maxMatch && xssSafe && wavValid && audit.overallPass;

      const reasons: string[] = [];
      if (!rowsMatch)
        reasons.push(
          `Expected ${item.expectedRowsAfterClean} rows, got ${finalDataset.labels.length}`
        );
      if (!seriesMatch)
        reasons.push(
          `Expected ${item.expectedSeriesCount} numeric series, got ${finalDataset.series.length}`
        );
      if (!minMatch)
        reasons.push(
          `Ground truth min=${item.groundTruthPrimaryMin}, computed=${primaryStats.min}`
        );
      if (!maxMatch)
        reasons.push(
          `Ground truth max=${item.groundTruthPrimaryMax}, computed=${primaryStats.max}`
        );
      if (!xssSafe) reasons.push('Unescaped <script> tag in exported HTML');
      if (!wavValid) reasons.push('Invalid WAV RIFF output');

      return {
        id: item.id,
        file: item.file,
        tier: item.tier,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        directParseOk: parseRes.ok,
        usedAutoClean,
        passedValidation: passed,
        elapsedMs: Math.round((performance.now() - t0) * 100) / 100,
        rowsParsed: finalDataset.labels.length,
        seriesParsed: finalDataset.series.length,
        computedMin: primaryStats.min,
        computedMax: primaryStats.max,
        groundTruthMin: item.groundTruthPrimaryMin,
        groundTruthMax: item.groundTruthPrimaryMax,
        wcagScore: audit.score,
        wavByteLength: wavBytes.byteLength,
        xssSafe,
        sampleAriaAnnouncement: pt0.screenReaderAnnouncement,
        failureReason: reasons.length > 0 ? reasons.join('; ') : null,
      };
    });

    const total = caseResults.length;
    const passedCount = caseResults.filter((r) => r.passedValidation).length;
    const failedCount = total - passedCount;

    const report = {
      generatedAt: new Date().toISOString(),
      suiteName: 'Stage 3.5 Real-World Validation Suite (12 Cases)',
      totalCases: total,
      passedCases: passedCount,
      failedCases: failedCount,
      passRatePct: Math.round((passedCount / total) * 1000) / 10,
      results: caseResults,
    };

    fs.writeFileSync(path.resolve(outFile), JSON.stringify(report, null, 2));
    console.log(
      `Wrote ${outFile}: ${passedCount}/${total} passed (${report.passRatePct}%)`
    );
    for (const r of caseResults) {
      console.log(
        `${r.passedValidation ? 'PASS' : 'FAIL'} [${r.tier}] ${r.file}` +
          (r.failureReason ? ` -> ${r.failureReason}` : '')
      );
    }
    expect(total).toBe(12);
  });
});
