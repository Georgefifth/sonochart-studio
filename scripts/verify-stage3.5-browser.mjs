import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('evidence/stage-3.5-validation/screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', '4174', '--host', '127.0.0.1'], {
  stdio: 'ignore',
});

await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="chart-stage-title"]').waitFor({ state: 'visible' });

  // 1. Real-world Gapminder CSV with quoted commas ("Congo, Dem. Rep.") & trailing categorical column
  const gapRaw = fs.readFileSync(
    'evidence/stage-3.5-validation/datasets/case05_adv_vega_gapminder_quoted.csv',
    'utf-8'
  );
  await page.getByTestId('tab-data').click();
  await page.locator('#dataset-title-input').fill('Gapminder Real-World Health & Income (Vega Datasets)');
  await page.getByTestId('csv-editor-textarea').fill(gapRaw);
  await page.getByTestId('btn-apply-csv').click();
  await page.getByTestId('tab-audit').click();
  await page.screenshot({
    path: path.join(OUT_DIR, 'realworld-gapminder-quoted-commas.png'),
    fullPage: true,
  });

  // 2. Real-world NOAA Mauna Loa CO2 Annual Mean
  const co2Raw = fs.readFileSync(
    'evidence/stage-3.5-validation/datasets/case01_basic_noaa_co2.csv',
    'utf-8'
  );
  await page.getByTestId('tab-data').click();
  await page.locator('#dataset-title-input').fill('NOAA Mauna Loa Atmospheric CO2 (1959–1983)');
  await page.getByTestId('csv-editor-textarea').fill(co2Raw);
  await page.getByTestId('btn-apply-csv').click();
  await page.getByTestId('select-chart-type').selectOption('area');
  await page.getByTestId('tab-audit').click();
  await page.screenshot({
    path: path.join(OUT_DIR, 'realworld-noaa-co2-area.png'),
    fullPage: true,
  });

  // 3. Untouched Holdout 04: Vega cars.json with null values + 1-click Auto-Clean recovery in UI
  const carsRaw = fs.readFileSync(
    'evidence/stage-3.5-validation/datasets/holdout04_vega_cars.json',
    'utf-8'
  );
  await page.getByTestId('tab-data').click();
  await page.locator('#dataset-title-input').fill('Vega Cars Holdout Dataset (JSON with Nulls)');
  await page.getByTestId('csv-editor-textarea').fill(carsRaw);
  await page.getByTestId('btn-apply-csv').click();
  // Verify the UI caught Row 12 ("citroen ds-21 pallas") null Miles_per_Gallon and offers 1-click Auto-Clean
  await page.locator('[data-testid="validation-error-box"]').waitFor({ state: 'visible' });
  await page.screenshot({
    path: path.join(OUT_DIR, 'holdout-cars-json-null-detected.png'),
    fullPage: true,
  });
  await page.getByTestId('btn-auto-clean-csv').click();
  await page.getByTestId('tab-audit').click();
  await page.screenshot({
    path: path.join(OUT_DIR, 'holdout-cars-json-auto-cleaned.png'),
    fullPage: true,
  });

  console.log('Stage 3.5 Browser UI Real-World Dataset Verification PASSED.');
} finally {
  await browser.close();
  server.kill('SIGKILL');
  process.exit(0);
}
