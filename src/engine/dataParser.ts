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

/**
 * Auto-detects CSV delimiter (comma, semicolon, or tab) outside of quoted strings.
 */
export function detectCsvDelimiter(headerLine: string): string {
  let inQuotes = false;
  let commas = 0;
  let semicolons = 0;
  let tabs = 0;
  for (let i = 0; i < headerLine.length; i++) {
    const ch = headerLine[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (ch === ',') commas++;
      else if (ch === ';') semicolons++;
      else if (ch === '\t') tabs++;
    }
  }
  if (semicolons > commas && semicolons >= tabs) return ';';
  if (tabs > commas && tabs > semicolons) return '\t';
  return ',';
}

/**
 * RFC 4180 quote-aware CSV row tokenizer.
 */
export function splitCsvRow(line: string, delimiter = ','): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function isFiniteMetricToken(rawCell: string): boolean {
  const cleaned = rawCell.replace(/[%$,]/g, '').trim();
  if (cleaned === '') return false;
  const num = Number(cleaned);
  return Number.isFinite(num);
}

export function parseDatasetInput(
  rawInput: string,
  meta?: Partial<Pick<ChartDataset, 'id' | 'title' | 'subtitle' | 'category' | 'sourceName' | 'sourceUrl'>>
): ParseResult {
  // Strip UTF-8 BOM if present
  const trimmed = rawInput.replace(/^\uFEFF/, '').trim();
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

    const rawKeys = Object.keys(rows[0]);
    if (rawKeys.length < 2) {
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

    // If the first key in the JSON object is numeric (e.g., Vega's barley.json where "yield" comes before "variety"),
    // promote the first string-valued property (or date/name/year label property) to Column 1 so the X-axis label is semantic.
    let labelKey = rawKeys[0];
    if (typeof rows[0][labelKey] === 'number') {
      const stringKey = rawKeys.find((k) => typeof rows[0][k] === 'string');
      if (stringKey) {
        labelKey = stringKey;
      }
    }
    const keys = [labelKey, ...rawKeys.filter((k) => k !== labelKey)];

    const escapeCsvCell = (val: unknown) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const csvLines = [keys.map(escapeCsvCell).join(',')];
    for (const r of rows) {
      csvLines.push(keys.map((k) => escapeCsvCell(r[k])).join(','));
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
    .replace(/^\uFEFF/, '')
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

  const delimiter = detectCsvDelimiter(lines[0]);
  const headers = splitCsvRow(lines[0], delimiter);
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

  const tokenizedRows = lines.slice(1).map((rawLine, idx) => ({
    lineNum: idx + 2,
    rawLine,
    cells: splitCsvRow(rawLine, delimiter),
  }));

  // Identify which columns (index >= 1) contain at least one finite numeric value.
  // Purely categorical string columns (0 numeric rows across the entire table, such as
  // ISO country codes "ABW" or region tags "sub_saharan_africa" in real-world Gapminder/WorldBank CSVs)
  // are automatically excluded when at least one other column is numeric.
  const colNumericCounts = headers.map((_, colIdx) => {
    if (colIdx === 0) return 0;
    let count = 0;
    for (const row of tokenizedRows) {
      if (row.cells.length === headers.length && isFiniteMetricToken(row.cells[colIdx] || '')) {
        count++;
      }
    }
    return count;
  });

  const anyNumericColumn = colNumericCounts.some((c) => c > 0);
  const candidateColIndices: number[] = [];
  for (let c = 1; c < headers.length; c++) {
    if (!anyNumericColumn || colNumericCounts[c] > 0) {
      candidateColIndices.push(c);
    }
  }

  const activeColIndices = candidateColIndices.slice(0, 4);
  const seriesCount = activeColIndices.length;

  const errors: ParseValidationError[] = [];
  const validCsvLines: string[] = [
    [headers[0], ...activeColIndices.map((c) => headers[c])].join(','),
  ];
  const labels: string[] = [];
  const seriesValues: number[][] = Array.from({ length: seriesCount }, () => []);

  for (const row of tokenizedRows) {
    const { lineNum, rawLine, cells } = row;

    if (cells.length !== headers.length) {
      errors.push({
        line: lineNum,
        rawLine,
        message: `Row ${lineNum} has ${cells.length} columns, expected ${headers.length} columns (${headers.join(', ')}).`,
        suggestion: `Ensure row ${lineNum} has ${headers.length} ${delimiter === ';' ? 'semicolon' : 'comma'}-separated values.`,
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
      const colIdx = activeColIndices[s];
      const rawCell = cells[colIdx];
      const cleaned = rawCell.replace(/[%$,]/g, '').trim();
      const num = Number(cleaned);
      if (cleaned === '' || !Number.isFinite(num)) {
        rowValid = false;
        errors.push({
          line: lineNum,
          column: colIdx + 1,
          rawLine,
          message: `Row ${lineNum} ("${rawLine}"): Column ${colIdx + 1} ("${headers[colIdx]}") has non-numeric value "${rawCell}".`,
          suggestion: `Replace "${rawCell}" on line ${lineNum} with a finite number, or click "Auto-Clean Invalid Rows".`,
        });
      } else {
        parsedNums.push(num);
      }
    }

    if (rowValid) {
      labels.push(label);
      const safeLabel = label.includes(',') ? `"${label.replace(/"/g, '""')}"` : label;
      validCsvLines.push([safeLabel, ...parsedNums.map(String)].join(','));
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

  const seriesMeta = activeColIndices.map((c) => extractUnitFromHeader(headers[c]));
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

  const normalizedCsv = validCsvLines.join('\n');

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
    rawCsv: normalizedCsv,
  };

  return {
    ok: true,
    dataset,
    errors: [],
  };
}
