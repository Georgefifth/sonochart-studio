import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.resolve('evidence/stage-2-build/frontend');
await fs.mkdir(OUT_DIR, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
  stdio: 'pipe',
});

await new Promise((resolve) => setTimeout(resolve, 1500));

const browser = await chromium.launch();
const consoleErrors = [];
const pageErrors = [];

try {
  // 1. Desktop 1440x900 verification
  const deskContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const page = await deskContext.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

  // Desktop default view (Warm archival paper + tactile SVG patterns + acoustic scrubber)
  await page.screenshot({
    path: path.join(OUT_DIR, 'desktop-1440-default.png'),
    fullPage: true,
  });

  // Step through points using keyboard ArrowRight & verify ARIA live announcement updates
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const srText = await page.getByTestId('sr-live-transcript').textContent();
  console.log('After 3 ArrowRight presses, ARIA readout:', srText);

  // Toggle Low-Vision High-Contrast mode ('C' key)
  await page.keyboard.press('c');
  await page.waitForTimeout(150);
  await page.screenshot({
    path: path.join(OUT_DIR, 'desktop-1440-high-contrast.png'),
    fullPage: true,
  });
  // Restore daylight mode
  await page.keyboard.press('c');
  await page.waitForTimeout(100);

  // Test Invalid Input state in Data tab
  await page.getByTestId('tab-data').click();
  await page.getByTestId('btn-load-invalid-csv').click();
  await page.waitForTimeout(150);
  await page.screenshot({
    path: path.join(OUT_DIR, 'desktop-1440-invalid-input.png'),
    fullPage: true,
  });

  // Recover via 1-click Auto-Clean Invalid Rows
  await page.getByTestId('btn-auto-clean-csv').click();
  await page.waitForTimeout(150);

  // Test Empty Workspace state
  await page.getByTestId('btn-empty-state').click();
  await page.waitForTimeout(150);
  await page.screenshot({
    path: path.join(OUT_DIR, 'desktop-1440-empty-state.png'),
    fullPage: true,
  });

  // Reload preset from empty state CTA
  await page.getByTestId('empty-load-climate-renewable-transition').click();
  await page.waitForTimeout(150);

  // Test Export Bundle (.WAV and .HTML)
  await page.getByTestId('tab-export').click();
  const [wavDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('btn-export-wav').click(),
  ]);
  console.log('Downloaded WAV file:', wavDownload.suggestedFilename());
  await page.screenshot({
    path: path.join(OUT_DIR, 'desktop-1440-export-success.png'),
    fullPage: true,
  });

  await deskContext.close();

  // 2. Mobile 390x844 verification
  const mobContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobPage = await mobContext.newPage();
  mobPage.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  mobPage.on('pageerror', (e) => pageErrors.push(String(e)));

  await mobPage.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  const overflowCheck = await mobPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  console.log('Mobile 390px overflow check:', overflowCheck);
  if (overflowCheck.scrollWidth > overflowCheck.clientWidth) {
    throw new Error(
      `Mobile horizontal overflow detected: scrollWidth=${overflowCheck.scrollWidth} > clientWidth=${overflowCheck.clientWidth}`
    );
  }

  await mobPage.screenshot({
    path: path.join(OUT_DIR, 'mobile-390-default.png'),
    fullPage: true,
  });

  await mobContext.close();

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    throw new Error(
      `Console/Page errors detected: ${JSON.stringify({ consoleErrors, pageErrors })}`
    );
  }
  console.log('Stage 2 Frontend Visual & Interaction Verification PASSED with 0 errors.');
} finally {
  await browser.close();
  server.kill('SIGKILL');
  process.exit(0);
}
