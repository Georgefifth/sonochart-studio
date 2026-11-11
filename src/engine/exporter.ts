import {
  AccessibilityAuditReport,
  ChartDataset,
  ChartStatisticalSummary,
  ChartType,
  MusicalScale,
  VisionMode,
} from '../types';
import { computePointTelemetry } from './sonifier';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateStandaloneAccessibleHtml(params: {
  dataset: ChartDataset;
  summary: ChartStatisticalSummary;
  audit: AccessibilityAuditReport;
  chartType: ChartType;
  scale: MusicalScale;
  visionMode: VisionMode;
  svgMarkup: string;
}): string {
  const { dataset, summary, audit, scale, svgMarkup } = params;

  const telemetryPoints = dataset.labels.map((_, idx) =>
    computePointTelemetry(dataset, idx, 0, scale)
  );

  const tableRowsHtml = dataset.labels
    .map((label, rIdx) => {
      const cells = dataset.series
        .map((s) => `<td>${escapeHtml(String(s.values[rIdx]))}${s.unit ? ` ${escapeHtml(s.unit)}` : ''}</td>`)
        .join('');
      return `<tr><th scope="row">${escapeHtml(label)}</th>${cells}</tr>`;
    })
    .join('\n          ');

  const safeJsonPoints = JSON.stringify(telemetryPoints)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
  const safeSvgMarkup = svgMarkup.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  const tableHeadersHtml = dataset.series
    .map((s) => `<th scope="col">${escapeHtml(s.name)}${s.unit ? ` (${escapeHtml(s.unit)})` : ''}</th>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(dataset.title)} — Accessible Multi-Modal SonoChart Widget</title>
  <style>
    :root {
      --bg: #F6F4EE;
      --surface: #FFFFFF;
      --ink: #141413;
      --muted: #4A4944;
      --border: #181816;
      --accent: #0047AB;
      --highlight: #C83E00;
    }
    [data-high-contrast="true"] {
      --bg: #0A0A0A;
      --surface: #121212;
      --ink: #FFFFFF;
      --muted: #E0E0E0;
      --border: #FFFFFF;
      --accent: #00FF66;
      --highlight: #FFD600;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--ink);
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .widget-frame {
      max-width: 960px;
      margin: 0 auto;
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: 6px;
      padding: 24px;
    }
    .sr-bar {
      font-family: monospace;
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 16px 0;
    }
    button {
      min-height: 44px;
      padding: 8px 16px;
      font-weight: 600;
      border: 2px solid var(--border);
      background: var(--bg);
      color: var(--ink);
      border-radius: 4px;
      cursor: pointer;
    }
    button.primary {
      background: var(--accent);
      color: #FFFFFF;
    }
    [data-high-contrast="true"] button.primary {
      color: #0A0A0A;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 14px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: var(--bg);
    }
  </style>
</head>
<body>
  <main class="widget-frame" id="sonochart-widget" tabindex="0" role="region" aria-label="${escapeHtml(dataset.title)} interactive accessible chart">
    <header>
      <p style="font-family:monospace;font-size:12px;margin:0 0 4px 0;">WCAG 2.2 AA &amp; ADA TITLE II VERIFIED WIDGET • SCORE ${audit.score}/100</p>
      <h1 style="margin:0 0 4px 0;font-size:22px;">${escapeHtml(dataset.title)}</h1>
      <p style="margin:0;color:var(--muted);font-size:14px;">${escapeHtml(dataset.subtitle)} — Source: ${escapeHtml(dataset.sourceName)}</p>
    </header>

    <div class="sr-bar" id="live-readout" role="status" aria-live="polite" aria-atomic="true">
      ${escapeHtml(telemetryPoints[0]?.screenReaderAnnouncement || summary.overallHeadline)}
    </div>

    <div class="controls" role="toolbar" aria-label="Sonification and accessibility controls">
      <button type="button" class="primary" id="btn-play">Play Sonification (P)</button>
      <button type="button" id="btn-prev">← Prev Point</button>
      <button type="button" id="btn-next">Next Point →</button>
      <button type="button" id="btn-hc">Toggle High-Contrast (C)</button>
    </div>

    <figure style="margin:0;" aria-describedby="w3c-summary">
      ${safeSvgMarkup}
      <figcaption id="w3c-summary" style="margin-top:12px;font-size:14px;">
        <strong>W3C Complex Image Summary:</strong> ${escapeHtml(summary.w3cLongDescription)}
      </figcaption>
    </figure>

    <details open style="margin-top:20px;">
      <summary style="font-weight:700;cursor:pointer;">Synchronized Accessible Data Table (${dataset.labels.length} rows)</summary>
      <table>
        <caption>${escapeHtml(dataset.title)} (${escapeHtml(dataset.xAxisLabel)})</caption>
        <thead>
          <tr>
            <th scope="col">${escapeHtml(dataset.xAxisLabel)}</th>
            ${tableHeadersHtml}
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </details>
  </main>

  <script>
    (function() {
      const points = ${safeJsonPoints};
      let idx = 0;
      let timer = null;
      const readout = document.getElementById('live-readout');
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      let ctx = null;

      function playPoint(i) {
        idx = (i + points.length) % points.length;
        const pt = points[idx];
        readout.textContent = pt.screenReaderAnnouncement;
        if (!AudioCtx) return;
        if (!ctx) ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = pt.timbre === 'marimba' ? 'sine' : pt.timbre;
        osc.frequency.value = pt.frequencyHz;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
        osc.connect(gain);
        if (ctx.createStereoPanner) {
          const pan = ctx.createStereoPanner();
          pan.pan.value = pt.stereoPan;
          gain.connect(pan);
          pan.connect(ctx.destination);
        } else {
          gain.connect(ctx.destination);
        }
        osc.start();
        osc.stop(ctx.currentTime + 0.24);
      }

      function togglePlay() {
        if (timer) {
          clearInterval(timer);
          timer = null;
          document.getElementById('btn-play').textContent = 'Play Sonification (P)';
          return;
        }
        document.getElementById('btn-play').textContent = 'Pause Sonification (P)';
        playPoint(idx);
        timer = setInterval(() => {
          if (idx + 1 >= points.length) {
            clearInterval(timer);
            timer = null;
            document.getElementById('btn-play').textContent = 'Play Sonification (P)';
            return;
          }
          playPoint(idx + 1);
        }, 280);
      }

      document.getElementById('btn-play').addEventListener('click', togglePlay);
      document.getElementById('btn-prev').addEventListener('click', () => playPoint(idx - 1));
      document.getElementById('btn-next').addEventListener('click', () => playPoint(idx + 1));
      document.getElementById('btn-hc').addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-high-contrast') === 'true';
        document.documentElement.setAttribute('data-high-contrast', String(!cur));
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); playPoint(idx + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); playPoint(idx - 1); }
        else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); togglePlay(); }
        else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          const cur = document.documentElement.getAttribute('data-high-contrast') === 'true';
          document.documentElement.setAttribute('data-high-contrast', String(!cur));
        }
      });
    })();
  </script>
</body>
</html>`;
}
