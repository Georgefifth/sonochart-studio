import {
  ChartDataset,
  DataSeries,
  InstrumentTimbre,
  MarkerShape,
  ParseResult,
  ParseValidationError,
  PatternId,
} from '../types';

const SERIES_PALETTE = ['#0047AB', '#C83E00', '#0B6E4F', '#6A1B9A'];
const HIGH_CONTRAST_PALETTE = ['#00FF66', '#FFD600', '#00E5FF', '#FF6EC7'];
const PATTERNS: PatternId[] = ['diagonal-hatch', 'cross-hatch', 'dot-matrix', 'vertical-bars'];
const MARKERS: MarkerShape[] = ['circle', 'diamond', 'square', 'triangle'];
const TIMBRES: InstrumentTimbre[] = ['triangle', 'marimba', 'sine', 'sawtooth-warm'];

function extractUnitFromHeader(header: string): { cleanName: string; unit: string } {
  const match = header.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { cleanName: match[1].trim(), unit: match[2].trim() };
  }
  return { cleanName: header.trim(), unit: '' };
}

export function parseDatasetInput(
  rawInput: string,
  meta?: Partial<Pick<ChartDataset, 'id' | 'title' | 'subtitle' | 'category' | 'sourceName' | 'sourceUrl'>>
): ParseResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      ok: false,
      errors: [
        {
          line: 1,
          rawLine: '',
          message: 'Dataset input is empty.',
          suggestion: 'Paste at least a header row and 2 data rows in CSV format, or load a preset dataset.',
        },
      ],
    };
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseJsonInput(trimmed, meta);
  }

  return parseCsvInput(trimmed, meta);
}

function parseJsonInput(
  rawJson: string,
  meta?: Partial<Pick<ChartDataset, 'id' | 'title' | 'subtitle' | 'category' | 'sourceName' | 'sourceUrl'>>
): ParseResult {
  try {
    const parsed = JSON.parse(rawJson);
    const rows: Record<string, unknown>[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.data)
      ? parsed.data
      : [];

    if (rows.length < 2) {
      return {
        ok: false,
        errors: [
          {
            line: 1,
            rawLine: rawJson.slice(0, 80),
            message: 'JSON input must be an array of at least 2 row objects.',
            suggestion: 'Provide an array like [{"Year": "2023", "Solar (GW)": 1419}, {"Year": "2024", "Solar (GW)": 1865}].',
          },
        ],
      };
    }

    const keys = Object.keys(rows[0]);
    if (keys.length < 2) {
      return {
        ok: false,
        errors: [
          {
            line: 1,
            rawLine: JSON.stringify(rows[0]),
            message: 'Each JSON object must contain 1 label key and at least 1 numeric series key.',
            suggestion: 'Add at least one numeric metric property to each object.',
          },
        ],
      };
    }

    const csvLines = [keys.join(',')];
    for (const r of rows) {
      csvLines.push(keys.map((k) => String(r[k] ?? '')).join(','));
    }
    return parseCsvInput(csvLines.join('\n'), meta);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
    return {
      ok: false,
      errors: [
        {
          line: 1,
          rawLine: rawJson.split('\n')[0] || '',
          message: `JSON Parse Error: ${msg}`,
          suggestion: 'Fix JSON syntax errors or switch to standard comma-separated CSV rows.',
        },
      ],
    };
  }
}

function parseCsvInput(
  rawCsv: string,
  meta?: Partial<Pick<ChartDataset, 'id' | 'title' | 'subtitle' | 'category' | 'sourceName' | 'sourceUrl'>>
): ParseResult {
  const lines = rawCsv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) {
    return {
      ok: false,
      errors: [
        {
          line: lines.length,
          rawLine: lines[lines.length - 1] || '',
          message: 'At least 1 header row and 2 data rows are required to build a trend chart.',
          suggestion: 'Add another comma-separated data row below the header.',
        },
      ],
    };
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  if (headers.length < 2 || headers.some((h) => h.length === 0)) {
    return {
      ok: false,
      errors: [
        {
          line: 1,
          rawLine: lines[0],
          message: 'Header row must contain an X-axis label column and at least 1 data series column.',
          suggestion: 'Example header: Year,Solar Capacity (GW),Wind Capacity (GW)',
        },
      ],
    };
  }

  const errors: ParseValidationError[] = [];
  const validCsvLines: string[] = [lines[0]];
  const labels: string[] = [];
  const seriesCount = Math.min(headers.length - 1, 4);
  const seriesValues: number[][] = Array.from({ length: seriesCount }, () => []);

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const cells = rawLine.split(',').map((c) => c.trim());

    if (cells.length !== headers.length) {
      errors.push({
        line: lineNum,
        rawLine,
        message: `Row ${lineNum} has ${cells.length} columns, expected ${headers.length} columns (${headers.join(', ')}).`,
        suggestion: `Ensure row ${lineNum} has exactly ${headers.length - 1} comma-separated numeric values after the label.`,
      });
      continue;
    }

    const label = cells[0];
    if (!label) {
      errors.push({
        line: lineNum,
        column: 1,
        rawLine,
        message: `Row ${lineNum} is missing its X-axis category/time label in Column 1.`,
        suggestion: `Provide a non-empty label at the start of row ${lineNum}.`,
      });
      continue;
    }

    let rowValid = true;
    const parsedNums: number[] = [];

    for (let s = 0; s < seriesCount; s++) {
      const rawVal = cells[s + 1].replace(/[%$,]/g, '');
      const num = Number(rawVal);
      if (rawVal === '' || !Number.isFinite(num)) {
        rowValid = false;
        errors.push({
          line: lineNum,
          column: s + 2,
          rawLine,
          message: `Row ${lineNum} ("${rawLine}"): Column ${s + 2} ("${headers[s + 1]}") has non-numeric value "${cells[s + 1]}".`,
          suggestion: `Replace "${cells[s + 1]}" on line ${lineNum} with a finite number, or click "Auto-Clean Invalid Rows".`,
        });
      } else {
        parsedNums.push(num);
      }
    }

    if (rowValid) {
      labels.push(label);
      validCsvLines.push(rawLine);
      for (let s = 0; s < seriesCount; s++) {
        seriesValues[s].push(parsedNums[s]);
      }
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      cleanedCsvSuggestion: validCsvLines.length >= 3 ? validCsvLines.join('\n') : undefined,
    };
  }

  const seriesMeta = headers.slice(1, 1 + seriesCount).map(extractUnitFromHeader);
  const primaryUnit = seriesMeta[0]?.unit || '';

  const series: DataSeries[] = seriesMeta.map((sm, idx) => ({
    id: `series-${idx + 1}`,
    name: sm.cleanName,
    unit: sm.unit || primaryUnit,
    color: SERIES_PALETTE[idx % SERIES_PALETTE.length],
    highContrastColor: HIGH_CONTRAST_PALETTE[idx % HIGH_CONTRAST_PALETTE.length],
    patternId: PATTERNS[idx % PATTERNS.length],
    markerShape: MARKERS[idx % MARKERS.length],
    timbre: TIMBRES[idx % TIMBRES.length],
    values: seriesValues[idx],
  }));

  const dataset: ChartDataset = {
    id: meta?.id || 'custom-dataset',
    title: meta?.title || `${series.map((s) => s.name).join(' vs. ')} by ${headers[0]}`,
    subtitle:
      meta?.subtitle ||
      `Multi-modal accessible dataset (${labels.length} points across ${series.length} series)`,
    category: meta?.category || 'Accessibility',
    sourceName: meta?.sourceName || 'User Authored CSV / JSON Dataset',
    sourceUrl: meta?.sourceUrl || 'https://www.w3.org/WAI/tutorials/images/complex/',
    xAxisLabel: headers[0],
    yAxisUnit: primaryUnit,
    labels,
    series,
    rawCsv: lines.join('\n'),
  };

  return {
    ok: true,
    dataset,
    errors: [],
  };
}
