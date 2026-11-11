import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChartDataset,
  ChartType,
  MusicalScale,
  ParseValidationError,
  VisionMode,
} from './types';
import { INVALID_SAMPLE_CSV, PRESET_DATASETS } from './data/presets';
import { parseDatasetInput } from './engine/dataParser';
import { generateChartSummary } from './engine/statistics';
import { auditChartAccessibility } from './engine/colorAccessibility';
import {
  computePointTelemetry,
  playAcousticPoint,
  synthesizeDatasetWavBytes,
  valueToScaleNote,
} from './engine/sonifier';
import { generateStandaloneAccessibleHtml } from './engine/exporter';
import { TactileChartCanvas } from './components/TactileChartCanvas';

type InspectorTab = 'data' | 'audit' | 'export';

interface StatusFeedback {
  type: 'loading' | 'success' | 'error';
  message: string;
}

const STORAGE_KEY = 'sonochart_studio_state_v1';

interface PersistedStudioState {
  dataset: ChartDataset | null;
  rawInputText: string;
  customTitle: string;
  chartType: ChartType;
  scale: MusicalScale;
  visionMode: VisionMode;
  highContrast: boolean;
  tactilePatternsEnabled: boolean;
}

function loadPersistedState(): Partial<PersistedStudioState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedStudioState>;
  } catch {
    return {};
  }
}

export const App: React.FC = () => {
  const initial = useMemo(() => loadPersistedState(), []);

  const [dataset, setDataset] = useState<ChartDataset | null>(
    initial.dataset !== undefined ? initial.dataset : PRESET_DATASETS[0]
  );
  const [rawInputText, setRawInputText] = useState<string>(
    initial.rawInputText !== undefined ? initial.rawInputText : PRESET_DATASETS[0].rawCsv
  );
  const [customTitle, setCustomTitle] = useState<string>(
    initial.customTitle !== undefined ? initial.customTitle : PRESET_DATASETS[0].title
  );
  const [parseErrors, setParseErrors] = useState<ParseValidationError[]>([]);
  const [cleanedCsvSuggestion, setCleanedCsvSuggestion] = useState<string | undefined>(
    undefined
  );

  const [chartType, setChartType] = useState<ChartType>(initial.chartType ?? 'multi-bar');
  const [scale, setScale] = useState<MusicalScale>(initial.scale ?? 'pentatonic');
  const [tempoMs, setTempoMs] = useState<number>(280);
  const [visionMode, setVisionMode] = useState<VisionMode>(initial.visionMode ?? 'normal');
  const [highContrast, setHighContrastState] = useState<boolean>(
    initial.highContrast ?? false
  );
  const [tactilePatternsEnabled, setTactilePatternsEnabled] = useState<boolean>(
    initial.tactilePatternsEnabled ?? true
  );
  const [playAllSeriesHarmony, setPlayAllSeriesHarmony] = useState<boolean>(true);

  const applyHighContrast = (nextVal: boolean | ((prev: boolean) => boolean)) => {
    setHighContrastState((prev) => {
      const resolved = typeof nextVal === 'function' ? nextVal(prev) : nextVal;
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute(
          'data-high-contrast',
          resolved ? 'true' : 'false'
        );
      }
      return resolved;
    });
  };

  const [activePointIndex, setActivePointIndex] = useState<number>(0);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('audit');
  const [statusFeedback, setStatusFeedback] = useState<StatusFeedback | null>({
    type: 'success',
    message:
      'Ready: 11 intervals × 2 series loaded. Use ← / → Arrow keys or press Play Sonification (P) to experience spatial audio & ARIA readout.',
  });

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-high-contrast',
      highContrast ? 'true' : 'false'
    );
  }, [highContrast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const toSave: PersistedStudioState = {
        dataset,
        rawInputText,
        customTitle,
        chartType,
        scale,
        visionMode,
        highContrast,
        tactilePatternsEnabled,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    dataset,
    rawInputText,
    customTitle,
    chartType,
    scale,
    visionMode,
    highContrast,
    tactilePatternsEnabled,
  ]);

  const summary = useMemo(() => {
    if (!dataset) return null;
    return generateChartSummary(dataset);
  }, [dataset]);

  const audit = useMemo(() => {
    if (!dataset) return null;
    return auditChartAccessibility(dataset, {
      visionMode,
      highContrast,
      tactilePatternsEnabled,
    });
  }, [dataset, visionMode, highContrast, tactilePatternsEnabled]);

  const currentTelemetry = useMemo(() => {
    if (!dataset) return null;
    return computePointTelemetry(
      dataset,
      activePointIndex,
      activeSeriesIndex,
      scale
    );
  }, [dataset, activePointIndex, activeSeriesIndex, scale]);

  const allPointsTelemetry = useMemo(() => {
    if (!dataset) return [];
    return dataset.labels.map((_, idx) =>
      computePointTelemetry(dataset, idx, activeSeriesIndex, scale)
    );
  }, [dataset, activeSeriesIndex, scale]);

  const triggerStepWithAudio = (nextPointIdx: number, nextSeriesIdx = activeSeriesIndex) => {
    if (!dataset || dataset.labels.length === 0) return;
    const total = dataset.labels.length;
    const wrappedIdx = ((nextPointIdx % total) + total) % total;
    const safeSeries = Math.max(0, Math.min(dataset.series.length - 1, nextSeriesIdx));

    setActivePointIndex(wrappedIdx);
    setActiveSeriesIndex(safeSeries);

    const tel = computePointTelemetry(dataset, wrappedIdx, safeSeries, scale);
    const companions =
      playAllSeriesHarmony && dataset.series.length > 1 && summary
        ? dataset.series
            .map((s, sIdx) => {
              if (sIdx === safeSeries) return null;
              const st = summary.seriesStats[sIdx];
              const note = valueToScaleNote(
                s.values[wrappedIdx],
                st.min,
                st.max,
                scale,
                sIdx === 0 ? 48 : 55
              );
              return { freqHz: note.frequencyHz, timbre: s.timbre };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null)
        : undefined;

    playAcousticPoint(tel, Math.min(0.32, (tempoMs / 1000) * 0.9), companions);
  };

  // Automatic playback timer
  useEffect(() => {
    if (!isPlaying || !dataset) return;
    const timer = window.setInterval(() => {
      setActivePointIndex((prev) => {
        const next = prev + 1;
        if (next >= dataset.labels.length) {
          setIsPlaying(false);
          return prev;
        }
        const tel = computePointTelemetry(dataset, next, activeSeriesIndex, scale);
        playAcousticPoint(tel, Math.min(0.3, (tempoMs / 1000) * 0.88));
        return next;
      });
    }, tempoMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, dataset, activeSeriesIndex, scale, tempoMs]);

  // Global keyboard shortcuts (disabled when typing inside inputs/textareas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'TEXTAREA' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      if (!dataset) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        triggerStepWithAudio(activePointIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        triggerStepWithAudio(activePointIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setIsPlaying(false);
        triggerStepWithAudio(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setIsPlaying(false);
        triggerStepWithAudio(dataset.labels.length - 1);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        applyHighContrast((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const togglePlayback = () => {
    if (!dataset) return;
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    const startIdx =
      activePointIndex >= dataset.labels.length - 1 ? 0 : activePointIndex;
    triggerStepWithAudio(startIdx);
    setIsPlaying(true);
  };

  const handleSelectPreset = (preset: ChartDataset) => {
    setIsPlaying(false);
    setDataset(preset);
    setRawInputText(preset.rawCsv);
    setCustomTitle(preset.title);
    setParseErrors([]);
    setCleanedCsvSuggestion(undefined);
    setActivePointIndex(0);
    setActiveSeriesIndex(0);
    setStatusFeedback({
      type: 'success',
      message: `Loaded preset "${preset.title}" (${preset.labels.length} rows × ${preset.series.length} series). All WCAG 2.2 AA & APCA checks verified.`,
    });
  };

  const handleApplyRawData = (inputOverride?: string, titleOverride?: string) => {
    const textToParse = inputOverride !== undefined ? inputOverride : rawInputText;
    const nextTitle = titleOverride !== undefined ? titleOverride : customTitle;

    setStatusFeedback({
      type: 'loading',
      message: 'Parsing & validating tabular dataset structure and recalculating W3C statistical summary...',
    });

    const result = parseDatasetInput(textToParse, {
      title: nextTitle.trim() || undefined,
    });

    if (!result.ok || !result.dataset) {
      setParseErrors(result.errors);
      setCleanedCsvSuggestion(result.cleanedCsvSuggestion);
      setStatusFeedback({
        type: 'error',
        message: `Validation failed with ${result.errors.length} error(s). Fix the highlighted row(s) below or click "Auto-Clean Invalid Rows".`,
      });
      return;
    }

    setParseErrors([]);
    setCleanedCsvSuggestion(undefined);
    setDataset(result.dataset);
    setRawInputText(result.dataset.rawCsv);
    setCustomTitle(result.dataset.title);
    setActivePointIndex(0);
    setActiveSeriesIndex(0);
    setStatusFeedback({
      type: 'success',
      message: `Applied dataset "${result.dataset.title}" (${result.dataset.labels.length} rows × ${result.dataset.series.length} series).`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusFeedback({
      type: 'loading',
      message: `Reading local file "${file.name}"...`,
    });
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const inferredTitle = file.name.replace(/\.(csv|json|txt)$/i, '');
      setRawInputText(content);
      setCustomTitle(inferredTitle);
      setInspectorTab('data');
      handleApplyRawData(content, inferredTitle);
    };
    reader.onerror = () => {
      setStatusFeedback({
        type: 'error',
        message: `Could not read "${file.name}". Please upload a valid UTF-8 .csv or .json file, or reset to a verified preset.`,
      });
    };
    reader.readAsText(file);
  };

  const triggerBrowserDownload = (
    filename: string,
    blob: Blob,
    description: string
  ) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    const kb = Math.round((blob.size / 1024) * 10) / 10;
    setStatusFeedback({
      type: 'success',
      message: `Exported ${filename} (${kb} KB) — ${description}`,
    });
  };

  const handleExportHtmlWidget = () => {
    if (!dataset || !summary || !audit) return;
    const svgMarkup = svgRef.current ? svgRef.current.outerHTML : '';
    const html = generateStandaloneAccessibleHtml({
      dataset,
      summary,
      audit,
      chartType,
      scale,
      visionMode,
      svgMarkup,
    });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    triggerBrowserDownload(
      `${dataset.id}-accessible-widget.html`,
      blob,
      'Self-contained WCAG 2.2 AA HTML widget with Web Audio sonification, tactile SVG & ARIA data table.'
    );
  };

  const handleExportWav = () => {
    if (!dataset) return;
    setStatusFeedback({
      type: 'loading',
      message: 'Synthesizing 44.1 kHz 16-bit Stereo PCM .WAV audio track...',
    });
    const wavBytes = synthesizeDatasetWavBytes(dataset, scale, tempoMs / 1000);
    const blob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
    triggerBrowserDownload(
      `${dataset.id}-sonification.wav`,
      blob,
      `44.1 kHz 16-bit Stereo PCM WAV (${dataset.labels.length} spatial audio intervals).`
    );
  };

  const handleExportSvg = () => {
    if (!dataset || !svgRef.current) return;
    const serializer = new XMLSerializer();
    const rawSvg = serializer.serializeToString(svgRef.current);
    const blob = new Blob([rawSvg], { type: 'image/svg+xml;charset=utf-8' });
    triggerBrowserDownload(
      `${dataset.id}-tactile-chart.svg`,
      blob,
      'Standalone vector SVG with embedded geometric hatch pattern definitions.'
    );
  };

  const handleExportAuditJson = () => {
    if (!dataset || !summary || !audit) return;
    const payload = {
      generatedAt: new Date().toISOString(),
      generator: 'SonoChart Studio v1.0 (Code for Change)',
      dataset: {
        id: dataset.id,
        title: dataset.title,
        sourceName: dataset.sourceName,
        pointsCount: dataset.labels.length,
        seriesCount: dataset.series.length,
      },
      accessibilityAudit: audit,
      statisticalSummary: summary,
      acousticTelemetry: allPointsTelemetry,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    triggerBrowserDownload(
      `${dataset.id}-wcag-audit.json`,
      blob,
      `WCAG 2.2 AA + APCA Lc compliance report (Score ${audit.score}/100).`
    );
  };

  return (
    <div className="studio-shell">
      {/* Top Studio Header */}
      <header className="studio-topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            SC
          </div>
          <div>
            <h1 className="brand-title">SonoChart Studio</h1>
            <p className="brand-subtitle">
              MULTI-MODAL ACCESSIBLE DATA VISUALIZATION &amp; SONIFICATION WORKBENCH
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="btn"
            data-testid="btn-toggle-high-contrast"
            onClick={() => applyHighContrast((prev) => !prev)}
            aria-pressed={highContrast}
          >
            {highContrast ? 'High-Contrast: ON (C)' : 'High-Contrast Mode (C)'}
          </button>

          <button
            type="button"
            className="btn"
            data-testid="btn-empty-state"
            onClick={() => {
              setIsPlaying(false);
              setDataset(null);
              setRawInputText('');
              setParseErrors([]);
              setStatusFeedback({
                type: 'loading',
                message: 'Workspace cleared. Choose a civic/STEM preset or paste custom CSV/JSON data to begin.',
              });
            }}
          >
            Clear Workspace
          </button>

          <button
            type="button"
            className="btn btn-primary"
            data-testid="btn-export-primary"
            disabled={!dataset}
            onClick={() => {
              setInspectorTab('export');
              handleExportHtmlWidget();
            }}
          >
            Export Accessible Bundle (.HTML)
          </button>
        </div>
      </header>

      {/* Preset Dataset Ribbon */}
      <nav className="dataset-ribbon" aria-label="Real-world social impact datasets">
        <div className="preset-list">
          <span className="toolbar-label">PRESET DATASETS:</span>
          {PRESET_DATASETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              data-testid={`preset-${preset.id}`}
              className={`preset-pill ${dataset?.id === preset.id ? 'active' : ''}`}
              onClick={() => handleSelectPreset(preset)}
            >
              [{preset.category}] {preset.title.split('(')[0].trim()}
            </button>
          ))}
        </div>

        <label className="btn" style={{ cursor: 'pointer' }}>
          <span>Upload .CSV / .JSON</span>
          <input
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            data-testid="file-upload-input"
          />
        </label>
      </nav>

      {/* Live Status Feedback Banner (Loading / Success / Error) */}
      {statusFeedback && (
        <div
          className={`status-banner ${statusFeedback.type}`}
          role="status"
          data-testid="status-banner"
        >
          <span>
            <strong>[{statusFeedback.type.toUpperCase()}]</strong> {statusFeedback.message}
          </span>
          {statusFeedback.type === 'error' && (
            <button
              type="button"
              className="btn"
              data-testid="btn-error-reset"
              onClick={() => handleSelectPreset(PRESET_DATASETS[0])}
            >
              Reset to Verified Preset
            </button>
          )}
        </div>
      )}

      {/* Main Studio Grid */}
      <main className="studio-main-grid">
        {/* Left / Center Stage Column */}
        <section className="stage-column" aria-label="Multi-modal chart stage and sonification deck">
          {!dataset || !summary || !audit || !currentTelemetry ? (
            <div className="empty-state-card" data-testid="empty-workspace-state">
              <h2 style={{ margin: 0, fontSize: '22px' }}>
                No Dataset Loaded in Studio Stage
              </h2>
              <p style={{ margin: 0, maxWidth: '560px', color: 'var(--ink-muted)' }}>
                Load one of the verified social-impact datasets below (Climate, Transit
                Accessibility, Clean Water, or Special-Ed Equity) or open the Data Editor
                to paste your own CSV or JSON table.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                {PRESET_DATASETS.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="btn btn-primary"
                    data-testid={`empty-load-${p.id}`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    Load {p.title.split('(')[0].trim()}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setInspectorTab('data');
                    setRawInputText(PRESET_DATASETS[0].rawCsv);
                  }}
                >
                  Open CSV / JSON Editor
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Signature Element Part 1: Live Contextual Screen-Reader Announcement Bar */}
              <div className="sr-live-bar" data-testid="sr-live-bar">
                <div className="sr-live-header">
                  <span>
                    NVDA / VOICEOVER CONTEXTUAL ARIA LIVE READOUT (FIXES HIGHCHARTS #28 &amp; CHART2MUSIC #689)
                  </span>
                  <span>
                    POINT {currentTelemetry.pointIndex + 1} OF {currentTelemetry.totalPoints}
                  </span>
                </div>
                <div
                  className="sr-live-transcript"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="sr-live-transcript"
                >
                  {currentTelemetry.screenReaderAnnouncement}
                </div>
              </div>

              {/* Chart Header, Vision Simulator & Tactile SVG Stage */}
              <div className="chart-header-card">
                <div className="chart-title-row">
                  <div>
                    <h2 className="chart-title" data-testid="chart-stage-title">
                      {dataset.title}
                    </h2>
                    <p className="chart-meta">
                      {dataset.subtitle} • Source: {dataset.sourceName}
                    </p>
                  </div>
                  <div
                    className="compliance-score-badge"
                    data-testid="compliance-score-badge"
                  >
                    WCAG 2.2 AA &amp; APCA SCORE: {audit.score}/100 (
                    {audit.overallPass ? 'VERIFIED PASS' : 'NEEDS ATTENTION'})
                  </div>
                </div>

                {/* Vision Mode & Chart Geometry Toolbar */}
                <div className="chart-toolbar-row">
                  <div className="toolbar-group">
                    <label htmlFor="select-chart-type" className="toolbar-label">
                      GEOMETRY:
                    </label>
                    <select
                      id="select-chart-type"
                      className="select-input"
                      data-testid="select-chart-type"
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value as ChartType)}
                    >
                      <option value="multi-bar">Grouped Tactile Bars</option>
                      <option value="line">Multi-Marker Line Plot</option>
                      <option value="area">Patterned Area Plot</option>
                      <option value="bar">Single-Series Bar Plot</option>
                    </select>

                    <button
                      type="button"
                      className="btn"
                      data-testid="btn-toggle-patterns"
                      onClick={() => setTactilePatternsEnabled((prev) => !prev)}
                      aria-pressed={tactilePatternsEnabled}
                    >
                      {tactilePatternsEnabled
                        ? 'Tactile SVG Patterns: ON'
                        : 'Tactile SVG Patterns: OFF'}
                    </button>
                  </div>

                  <div className="toolbar-group">
                    <label htmlFor="select-vision-mode" className="toolbar-label">
                      VISION SIMULATOR (MACHADO 2009):
                    </label>
                    <select
                      id="select-vision-mode"
                      className="select-input"
                      data-testid="select-vision-mode"
                      value={visionMode}
                      onChange={(e) => setVisionMode(e.target.value as VisionMode)}
                    >
                      <option value="normal">Normal Trichromacy</option>
                      <option value="deuteranopia">Deuteranopia (Red-Green, 6% M)</option>
                      <option value="protanopia">Protanopia (Red-Blind)</option>
                      <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
                      <option value="achromatopsia">Achromatopsia (Monochromacy)</option>
                    </select>
                  </div>
                </div>

                {/* Tactile Geometric-Pattern SVG Canvas */}
                <TactileChartCanvas
                  dataset={dataset}
                  chartType={chartType}
                  visionMode={visionMode}
                  highContrast={highContrast}
                  tactilePatternsEnabled={tactilePatternsEnabled}
                  activePointIndex={activePointIndex}
                  activeSeriesIndex={activeSeriesIndex}
                  onSelectPoint={(pIdx, sIdx) => {
                    setIsPlaying(false);
                    triggerStepWithAudio(pIdx, sIdx ?? activeSeriesIndex);
                  }}
                  svgRef={svgRef}
                />
              </div>

              {/* Signature Element Part 2: Spatial Web Audio Telemetry & Scrubber Deck */}
              <div className="acoustic-deck" data-testid="acoustic-deck">
                <div className="transport-row">
                  <div className="transport-buttons">
                    <button
                      type="button"
                      className="btn btn-vermilion"
                      data-testid="btn-play-sonification"
                      onClick={togglePlayback}
                    >
                      {isPlaying ? 'Pause Sonification (P)' : 'Play Sonification (P)'}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      data-testid="btn-step-prev"
                      onClick={() => {
                        setIsPlaying(false);
                        triggerStepWithAudio(activePointIndex - 1);
                      }}
                    >
                      ← Step Prev
                    </button>
                    <button
                      type="button"
                      className="btn"
                      data-testid="btn-step-next"
                      onClick={() => {
                        setIsPlaying(false);
                        triggerStepWithAudio(activePointIndex + 1);
                      }}
                    >
                      Step Next →
                    </button>
                    <button
                      type="button"
                      className="btn"
                      data-testid="btn-export-wav-quick"
                      onClick={handleExportWav}
                    >
                      Download .WAV Track
                    </button>
                  </div>

                  <div className="toolbar-group">
                    <label htmlFor="select-scale" className="toolbar-label">
                      SCALE:
                    </label>
                    <select
                      id="select-scale"
                      className="select-input"
                      data-testid="select-scale"
                      value={scale}
                      onChange={(e) => setScale(e.target.value as MusicalScale)}
                    >
                      <option value="pentatonic">C Major Pentatonic (Warm)</option>
                      <option value="major">C Diatonic Major</option>
                      <option value="chromatic">12-Tone Chromatic (Exact)</option>
                    </select>

                    {dataset.series.length > 1 && (
                      <select
                        aria-label="Active audio focus series"
                        className="select-input"
                        data-testid="select-active-series"
                        value={activeSeriesIndex}
                        onChange={(e) => {
                          const nextS = Number(e.target.value);
                          setActiveSeriesIndex(nextS);
                          triggerStepWithAudio(activePointIndex, nextS);
                        }}
                      >
                        {dataset.series.map((s, idx) => (
                          <option key={s.id} value={idx}>
                            Focus: {s.name} ({s.timbre})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Live Acoustic Telemetry Readout Pills */}
                <div className="telemetry-pills">
                  <span className="telemetry-pill" data-testid="telemetry-note">
                    PITCH: {currentTelemetry.noteName} ({currentTelemetry.frequencyHz} Hz)
                  </span>
                  <span className="telemetry-pill" data-testid="telemetry-pan">
                    STEREO PAN: {currentTelemetry.panLabel}
                  </span>
                  <span className="telemetry-pill" data-testid="telemetry-timbre">
                    TIMBRE: {currentTelemetry.timbre.toUpperCase()}
                  </span>
                  <span
                    className={`telemetry-pill ${
                      currentTelemetry.earconType !== 'none' ? 'earcon-active' : ''
                    }`}
                    data-testid="telemetry-earcon"
                  >
                    EARCON:{' '}
                    {currentTelemetry.earconType === 'none'
                      ? 'STANDARD NOTE'
                      : `${currentTelemetry.earconType.toUpperCase()} CHIME`}
                  </span>
                </div>

                {/* Interactive Point-by-Point Pitch Contour Scrubber */}
                <div
                  className="pitch-scrubber-strip"
                  role="group"
                  aria-label="Point-by-point sonification pitch scrubber"
                >
                  {allPointsTelemetry.map((pt) => {
                    const heightPct = Math.max(
                      18,
                      Math.min(100, Math.round(((pt.midiNote - 48) / 36) * 82 + 18))
                    );
                    const isCur = pt.pointIndex === activePointIndex;
                    return (
                      <button
                        key={`scrub-${pt.pointIndex}`}
                        type="button"
                        data-testid={`scrubber-point-${pt.pointIndex}`}
                        className={`scrubber-step-btn ${isCur ? 'active' : ''}`}
                        onClick={() => {
                          setIsPlaying(false);
                          triggerStepWithAudio(pt.pointIndex);
                        }}
                        aria-label={`Point ${pt.pointIndex + 1}: ${pt.label}, ${pt.value} ${pt.unit}, Note ${pt.noteName}`}
                        aria-current={isCur ? 'step' : undefined}
                      >
                        <div
                          className="scrubber-bar-fill"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span>{pt.noteName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right Inspector Column */}
        <aside className="inspector-column" aria-label="Accessibility Audit, Data Editor, and Export Inspector">
          <div className="inspector-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'audit'}
              data-testid="tab-audit"
              className={`tab-btn ${inspectorTab === 'audit' ? 'active' : ''}`}
              onClick={() => setInspectorTab('audit')}
            >
              1. WCAG &amp; W3C Audit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'data'}
              data-testid="tab-data"
              className={`tab-btn ${inspectorTab === 'data' ? 'active' : ''}`}
              onClick={() => setInspectorTab('data')}
            >
              2. CSV / JSON Data
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'export'}
              data-testid="tab-export"
              className={`tab-btn ${inspectorTab === 'export' ? 'active' : ''}`}
              onClick={() => setInspectorTab('export')}
            >
              3. Export Bundle
            </button>
          </div>

          <div className="inspector-body">
            {inspectorTab === 'audit' && dataset && summary && audit && (
              <>
                <div className="inspector-card">
                  <h3>W3C WAI Complex-Image Summary (Auto-Computed)</h3>
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600 }}>
                    {summary.overallHeadline}
                  </p>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '12.5px' }}>
                    {summary.keyFindings.map((kf, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>
                        {kf}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="inspector-card">
                  <h3>WCAG 2.2 AA + APCA Perceptual Contrast Matrix</h3>
                  {audit.checks.map((chk) => (
                    <div
                      key={chk.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-paper)',
                        fontSize: '12.5px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{chk.criterion}</span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: chk.passed ? 'var(--accent-pine)' : 'var(--danger)',
                          }}
                        >
                          {chk.passed ? '[PASS]' : '[WARN]'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--ink-muted)', marginTop: '2px', fontSize: '12px' }}>
                        {chk.detail}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="inspector-card">
                  <h3>Synchronized Accessible Data Table ({dataset.labels.length} rows)</h3>
                  <div className="data-table-wrapper">
                    <table className="accessible-table" data-testid="synchronized-data-table">
                      <thead>
                        <tr>
                          <th scope="col">{dataset.xAxisLabel}</th>
                          {dataset.series.map((s) => (
                            <th key={s.id} scope="col">
                              {s.name} {s.unit ? `(${s.unit})` : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataset.labels.map((lbl, rIdx) => (
                          <tr
                            key={`row-${rIdx}`}
                            className={rIdx === activePointIndex ? 'active-row' : ''}
                            onClick={() => {
                              setIsPlaying(false);
                              triggerStepWithAudio(rIdx);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <th scope="row">{lbl}</th>
                            {dataset.series.map((s) => (
                              <td key={`${s.id}-${rIdx}`}>{s.values[rIdx]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {inspectorTab === 'data' && (
              <div className="inspector-card">
                <h3>Author or Paste CSV / JSON Dataset</h3>
                <label htmlFor="dataset-title-input" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                  Chart Title
                </label>
                <input
                  id="dataset-title-input"
                  type="text"
                  className="select-input"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter descriptive chart title..."
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="csv-editor-textarea" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                    Tabular Data (CSV or JSON Array)
                  </label>
                  <button
                    type="button"
                    className="btn"
                    style={{ minHeight: '36px', padding: '4px 10px', fontSize: '12px' }}
                    data-testid="btn-load-invalid-csv"
                    onClick={() => {
                      setRawInputText(INVALID_SAMPLE_CSV);
                      handleApplyRawData(INVALID_SAMPLE_CSV, customTitle);
                    }}
                  >
                    Test Malformed CSV Input
                  </button>
                </div>

                <textarea
                  id="csv-editor-textarea"
                  data-testid="csv-editor-textarea"
                  className={`csv-textarea ${parseErrors.length > 0 ? 'invalid' : ''}`}
                  value={rawInputText}
                  onChange={(e) => setRawInputText(e.target.value)}
                  aria-invalid={parseErrors.length > 0}
                  placeholder="Year,Series A (Unit),Series B (Unit)&#10;2023,120,95&#10;2024,145,110"
                />

                {parseErrors.length > 0 && (
                  <div className="validation-error-box" role="alert" data-testid="validation-error-box">
                    <strong>
                      Invalid Input Detected ({parseErrors.length} issue
                      {parseErrors.length > 1 ? 's' : ''}):
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {parseErrors.map((err, idx) => (
                        <li key={idx}>
                          <strong>Line {err.line}:</strong> {err.message} — <em>{err.suggestion}</em>
                        </li>
                      ))}
                    </ul>
                    {cleanedCsvSuggestion && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-testid="btn-auto-clean-csv"
                        onClick={() => {
                          setRawInputText(cleanedCsvSuggestion);
                          handleApplyRawData(cleanedCsvSuggestion, customTitle);
                        }}
                      >
                        Auto-Clean Invalid Rows &amp; Apply
                      </button>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-testid="btn-apply-csv"
                    onClick={() => handleApplyRawData()}
                  >
                    Validate &amp; Render Dataset
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleSelectPreset(PRESET_DATASETS[0])}
                  >
                    Restore Default Preset
                  </button>
                </div>
              </div>
            )}

            {inspectorTab === 'export' && (
              <div className="inspector-card">
                <h3>Export 4-Layer Accessible Bundle</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-muted)' }}>
                  Every export is generated 100% locally in your browser with zero external
                  dependencies or cloud uploads.
                </p>

                <div className="export-grid">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-testid="btn-export-html"
                    disabled={!dataset}
                    onClick={handleExportHtmlWidget}
                  >
                    1. Standalone WCAG .HTML Widget
                  </button>
                  <button
                    type="button"
                    className="btn btn-vermilion"
                    data-testid="btn-export-wav"
                    disabled={!dataset}
                    onClick={handleExportWav}
                  >
                    2. Spatial Audio .WAV (16-Bit PCM)
                  </button>
                  <button
                    type="button"
                    className="btn"
                    data-testid="btn-export-svg"
                    disabled={!dataset}
                    onClick={handleExportSvg}
                  >
                    3. Tactile Pattern .SVG Vector
                  </button>
                  <button
                    type="button"
                    className="btn"
                    data-testid="btn-export-json"
                    disabled={!dataset}
                    onClick={handleExportAuditJson}
                  >
                    4. WCAG 2.2 + APCA Audit .JSON
                  </button>
                </div>

                {dataset && summary && audit && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      background: 'var(--bg-paper)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <strong>ACTIVE BUNDLE SUMMARY:</strong>
                    </div>
                    <div>• Dataset: {dataset.title}</div>
                    <div>
                      • Dimensions: {dataset.labels.length} points × {dataset.series.length} series
                    </div>
                    <div>
                      • Audio Synthesis: 44.1 kHz Stereo PCM ({scale} scale, {tempoMs}ms/pt)
                    </div>
                    <div>
                      • Compliance: Score {audit.score}/100 (Min ΔE: {audit.minPairwiseDeltaE})
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};
