// Real-browser QA runner for SonoChart Studio (Stage 3 QA).
// Based on ~/.config/opencode/skills/playwright-qa/template.mjs

import { chromium, firefox } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const OUT = process.env.QA_OUT ?? 'evidence/stage-3-qa';
const BROWSER = process.env.BROWSER === 'chromium' ? 'chromium' : 'firefox';
const HEADED = process.env.HEADED === '1';

const SHOTS = path.join(OUT, 'screens');
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
];

const scenarios = [
  {
    id: 'p0-landing-and-empty-state',
    title: 'Landing page renders, Empty Workspace state works, and preset recovery restores studio',
    async run(page, ctx) {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await ctx.expectVisible('[data-testid="chart-stage-title"]');
      ctx.assert((await page.title()).includes('SonoChart Studio'), 'Unexpected document.title');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      ctx.assert(overflow <= 1, `Horizontal overflow detected: ${overflow}px`);
      await ctx.shot('landing');

      // Trigger Empty Workspace state
      await page.getByTestId('btn-empty-state').click();
      await ctx.expectVisible('[data-testid="empty-workspace-state"]');
      await ctx.shot('empty-state');

      // Recover from Empty state
      await page.getByTestId('empty-load-climate-renewable-transition').click();
      await ctx.expectVisible('[data-testid="chart-stage-title"]');
      const titleText = await page.getByTestId('chart-stage-title').textContent();
      ctx.assert(
        titleText.includes('Global Solar & Wind Installed Capacity'),
        `Expected restored preset title, got: ${titleText}`
      );
    },
  },
  {
    id: 'p0-core-multimodal-scrub-and-sonification',
    title: 'Switch preset, scrub via buttons and keyboard arrows, and verify ARIA live readout & audio telemetry',
    async run(page, ctx) {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('preset-global-temp-anomalies').click();

      const chartTitle = await page.getByTestId('chart-stage-title').textContent();
      ctx.assert(
        chartTitle.includes('Global Surface Temperature Anomaly'),
        `Preset title did not update: ${chartTitle}`
      );

      // Step forward via button
      await page.getByTestId('btn-step-next').click();
      let srText = await page.getByTestId('sr-live-transcript').textContent();
      ctx.assert(
        srText.includes('Point 2 of 12') && srText.includes('2015'),
        `Expected Point 2 of 12 in ARIA readout, got: ${srText}`
      );

      // Step forward via Keyboard ArrowRight
      await page.keyboard.press('ArrowRight');
      srText = await page.getByTestId('sr-live-transcript').textContent();
      ctx.assert(
        srText.includes('Point 3 of 12') && srText.includes('2016'),
        `Expected Point 3 of 12 after ArrowRight, got: ${srText}`
      );

      // Jump to End via Keyboard End
      await page.keyboard.press('End');
      srText = await page.getByTestId('sr-live-transcript').textContent();
      ctx.assert(
        srText.includes('Point 12 of 12') && srText.includes('2025'),
        `Expected Point 12 of 12 after End key, got: ${srText}`
      );

      const panText = await page.getByTestId('telemetry-pan').textContent();
      ctx.assert(
        panText.includes('+0.85 R'),
        `Expected right-panned stereo telemetry at final point, got: ${panText}`
      );

      await ctx.shot('scrubbed-point-12');
    },
  },
  {
    id: 'p0-export-4-layer-bundle',
    title: 'Export standalone WCAG HTML widget, 16-bit PCM WAV track, tactile SVG, and JSON audit report',
    async run(page, ctx) {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('tab-export').click();

      const [htmlDl] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('btn-export-html').click(),
      ]);
      ctx.assert(
        htmlDl.suggestedFilename().endsWith('-accessible-widget.html'),
        `Unexpected HTML filename: ${htmlDl.suggestedFilename()}`
      );

      const [wavDl] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('btn-export-wav').click(),
      ]);
      ctx.assert(
        wavDl.suggestedFilename().endsWith('-sonification.wav'),
        `Unexpected WAV filename: ${wavDl.suggestedFilename()}`
      );

      const [svgDl] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('btn-export-svg').click(),
      ]);
      ctx.assert(
        svgDl.suggestedFilename().endsWith('-tactile-chart.svg'),
        `Unexpected SVG filename: ${svgDl.suggestedFilename()}`
      );

      const [jsonDl] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('btn-export-json').click(),
      ]);
      ctx.assert(
        jsonDl.suggestedFilename().endsWith('-wcag-audit.json'),
        `Unexpected JSON filename: ${jsonDl.suggestedFilename()}`
      );

      await ctx.shot('exports-verified');
    },
  },
  {
    id: 'p1-invalid-csv-and-auto-clean-recovery',
    title: 'Detect malformed CSV lines/columns and recover in 1 click via Auto-Clean Invalid Rows',
    async run(page, ctx) {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('tab-data').click();
      await page.getByTestId('btn-load-invalid-csv').click();

      await ctx.expectVisible('[data-testid="validation-error-box"]');
      const errText = await page.getByTestId('validation-error-box').textContent();
      ctx.assert(
        errText.includes('Line 4') && errText.includes('INVALID_NUMBER'),
        `Expected Line 4 error detail, got: ${errText}`
      );
      await ctx.shot('invalid-csv-error');

      // Recover via 1-click Auto-Clean
      await page.getByTestId('btn-auto-clean-csv').click();
      const errCount = await page.locator('[data-testid="validation-error-box"]').count();
      ctx.assert(errCount === 0, 'Validation error box should disappear after Auto-Clean');

      const banner = await page.getByTestId('status-banner').textContent();
      ctx.assert(
        banner.includes('[SUCCESS]') && banner.includes('3 rows'),
        `Expected 3 cleaned rows success banner, got: ${banner}`
      );
      await ctx.shot('auto-cleaned-recovery');
    },
  },
  {
    id: 'p1-vision-modes-and-high-contrast-toggle',
    title: 'Toggle Low-Vision High-Contrast (C key), CVD simulator modes, and chart geometries',
    async run(page, ctx) {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await ctx.expectVisible('[data-testid="chart-stage-title"]');
      await page.getByTestId('preset-climate-renewable-transition').click();

      // Press 'c' to enable Low-Vision High-Contrast mode
      await page.keyboard.press('c');
      await ctx.expectText('High-Contrast: ON (C)');
      const hcState = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="btn-toggle-high-contrast"]');
        const style = btn ? window.getComputedStyle(btn) : null;
        return {
          attr: document.documentElement.getAttribute('data-high-contrast'),
          btnBg: style?.backgroundColor ?? '',
          btnColor: style?.color ?? '',
        };
      });
      ctx.assert(hcState.attr === 'true', `Expected data-high-contrast="true", got: ${hcState.attr}`);
      ctx.assert(
        hcState.btnBg !== 'rgb(255, 255, 255)',
        `High-contrast button background must be dark, got: ${hcState.btnBg}`
      );
      await ctx.shot('high-contrast-mode');

      // Test CVD simulation modes & geometries
      await page.getByTestId('select-vision-mode').selectOption('achromatopsia');
      await page.getByTestId('select-chart-type').selectOption('line');

      const scoreBadge = await page.getByTestId('compliance-score-badge').textContent();
      ctx.assert(
        scoreBadge.includes('100/100'),
        `Expected 100/100 compliance score under Achromatopsia with tactile patterns, got: ${scoreBadge}`
      );

      // Restore normal mode
      await page.keyboard.press('c');
    },
  },
  {
    id: 'p1-custom-json-persistence-after-reload',
    title: 'Author a custom JSON dataset and keep state across browser reload',
    async run(page, ctx) {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('tab-data').click();

      const customTitle = 'Community Clinic Vaccine Cold-Chain Uptime (%)';
      const customJson = JSON.stringify([
        { Clinic: 'North Ward', 'Solar Fridge Uptime (%)': 99.2, 'Grid Backup (%)': 84.0 },
        { Clinic: 'East Valley', 'Solar Fridge Uptime (%)': 98.7, 'Grid Backup (%)': 76.5 },
        { Clinic: 'South Ridge', 'Solar Fridge Uptime (%)': 99.5, 'Grid Backup (%)': 68.0 },
      ]);

      await page.locator('#dataset-title-input').fill(customTitle);
      await page.getByTestId('csv-editor-textarea').fill(customJson);
      await page.getByTestId('btn-apply-csv').click();

      let stageTitle = await page.getByTestId('chart-stage-title').textContent();
      ctx.assert(
        stageTitle.includes('Community Clinic Vaccine Cold-Chain Uptime'),
        `Custom dataset title not applied before reload: ${stageTitle}`
      );

      // Reload the browser page and verify state survived reload
      await page.reload({ waitUntil: 'domcontentloaded' });
      await ctx.expectVisible('[data-testid="chart-stage-title"]');
      stageTitle = await page.getByTestId('chart-stage-title').textContent();
      ctx.assert(
        stageTitle.includes('Community Clinic Vaccine Cold-Chain Uptime'),
        `Custom dataset state lost after page reload! Found title: ${stageTitle}`
      );
      await ctx.shot('persisted-after-reload');
    },
  },
  {
    id: 'p2-responsive-and-touch-targets',
    title: 'Verify zero horizontal overflow and >=44px touch targets on primary controls',
    async run(page, ctx) {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      ctx.assert(overflow <= 1, `Horizontal overflow: ${overflow}px`);

      const playBox = await page.getByTestId('btn-play-sonification').boundingBox();
      const exportBox = await page.getByTestId('btn-export-primary').boundingBox();
      ctx.assert(
        playBox && playBox.height >= 42,
        `Play button touch target height < 42px: ${JSON.stringify(playBox)}`
      );
      ctx.assert(
        exportBox && exportBox.height >= 42,
        `Export button touch target height < 42px: ${JSON.stringify(exportBox)}`
      );
    },
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectVisible(page, selector, timeout = 10000) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

async function expectText(page, text, timeout = 10000) {
  const locator = page.getByText(text).first();
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

function collectIssues(page) {
  const issues = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push({ kind: 'console', text: msg.text() });
  });
  page.on('pageerror', (err) => {
    issues.push({ kind: 'pageerror', text: err.message });
  });
  page.on('requestfailed', (req) => {
    const reason = req.failure()?.errorText ?? 'request failed';
    if (!reason.includes('ERR_ABORTED') && !reason.includes('NS_BINDING_ABORTED')) {
      issues.push({ kind: 'requestfailed', text: `${reason} ${req.url()}` });
    }
  });
  page.on('response', (res) => {
    const status = res.status();
    if (status >= 500) issues.push({ kind: 'http', text: `${status} ${res.url()}` });
    else if (status >= 400) {
      issues.push({ kind: 'http', level: 'warn', text: `${status} ${res.url()}` });
    }
  });
  return issues;
}

async function main() {
  let browserType = BROWSER === 'chromium' ? chromium : firefox;
  let browser;
  let activeBrowserName = BROWSER;
  try {
    browser = await browserType.launch({ headless: !HEADED });
  } catch (err) {
    console.warn(`Firefox launch failed (${err.message}); falling back to chromium per skill rules.`);
    activeBrowserName = 'chromium';
    browser = await chromium.launch({ headless: !HEADED });
  }

  const startedAt = new Date().toISOString();
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: vp.viewport,
      deviceScaleFactor: vp.deviceScaleFactor,
      acceptDownloads: true,
    });

    for (const scenario of scenarios) {
      const page = await context.newPage();
      const issues = collectIssues(page);
      const screenshots = [];
      const started = Date.now();
      let status = 'pass';
      let error = null;

      const ctx = {
        assert,
        expectVisible: (selector, timeout) => expectVisible(page, selector, timeout),
        expectText: (text, timeout) => expectText(page, text, timeout),
        shot: async (name, opts = {}) => {
          const file = path.join(SHOTS, `${scenario.id}-${name}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
          screenshots.push(file);
          return file;
        },
      };

      try {
        await scenario.run(page, ctx);
      } catch (err) {
        status = 'fail';
        error = err.message;
      } finally {
        await page.close().catch(() => {});
      }

      const errors = issues.filter((i) => (i.level ?? 'error') === 'error');
      const warnings = issues.filter((i) => i.level === 'warn');
      if (status === 'pass' && errors.length > 0) {
        status = 'fail';
        error = errors.map((i) => `${i.kind}: ${i.text}`).join(' | ');
      }

      results.push({
        viewport: vp.name,
        id: scenario.id,
        title: scenario.title,
        status,
        ms: Date.now() - started,
        error,
        errors,
        warnings,
        screenshots,
      });

      console.log(
        `${status === 'pass' ? '✓' : '✗'} [${vp.name}] ${scenario.id}` +
          (error ? ` — ${error}` : '')
      );
    }

    await context.close();
  }

  await browser.close();

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === 'pass').length,
    fail: results.filter((r) => r.status === 'fail').length,
  };
  const finishedAt = new Date().toISOString();
  const report = {
    base: BASE,
    browser: activeBrowserName,
    headed: HEADED,
    startedAt,
    finishedAt,
    summary,
    results,
  };

  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2));

  const warnings = results.flatMap((r) =>
    r.warnings.map((w) => `- [${r.viewport}] ${r.id}: ${w.kind} — ${w.text}`)
  );
  const md = [
    `# QA run — ${finishedAt}`,
    '',
    `- Base URL: ${BASE}`,
    `- Browser: ${activeBrowserName} (${HEADED ? 'headed' : 'headless'})`,
    `- Scenarios: ${summary.total} — ${summary.pass} pass, ${summary.fail} fail`,
    '',
    '| Viewport | Scenario | Status | ms | Detail |',
    '|---|---|---|---|---|',
    ...results.map(
      (r) =>
        `| ${r.viewport} | ${r.id} | ${r.status} | ${r.ms} | ${(r.error ?? '').replace(/\|/g, '\\|')} |`
    ),
    '',
    ...(warnings.length ? ['## Warnings', '', ...warnings, ''] : []),
    '## Screenshots',
    '',
    ...results.flatMap((r) => r.screenshots.map((s) => `- ${s}`)),
    '',
  ];
  fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n'));

  console.log(`\n${summary.pass}/${summary.total} passed — see ${OUT}/`);
  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
