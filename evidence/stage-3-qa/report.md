# Stage 3 QA Report — SonoChart Studio

## 1. Test Environment & Scope

- **Deployed Production URL**: `https://georgefifth.github.io/sonochart-studio/`
- **Local Production Preview URL**: `http://127.0.0.1:4173`
- **Browser Engine**: Headless **Firefox** (Playwright `firefox.launch({ headless: true })`)
- **Viewports Tested**:
  - **Desktop**: `1440×900` (`deviceScaleFactor: 1`)
  - **Mobile**: `390×844` (`deviceScaleFactor: 2`)
- **Date**: 2026-11-11
- **Scenario Definition File**: `qa/scenarios.md`
- **Runner Script**: `qa/run.mjs`
- **Raw Machine-Readable Results**: `evidence/stage-3-qa/results.json` (Deployed) & `evidence/stage-3-qa/local/results.json` (Local)

---

## 2. Final Regression Summary (Deployed & Local)

- **Total Scenarios Executed**: **14** (7 end-to-end scenarios × 2 viewports) per target
- **Deployed Build (`https://georgefifth.github.io/sonochart-studio/`)**: **14 Pass / 0 Fail / 0 Blocked**
- **Local Build (`http://127.0.0.1:4173`)**: **14 Pass / 0 Fail / 0 Blocked**
- **Console / Page / Network Errors**: **0 `console.error`, 0 `pageerror`, 0 `requestfailed`, 0 HTTP 4xx/5xx**

| Viewport | Scenario ID | Priority | Title | Status | Duration (Deployed) |
|---|---|---|---|---|---|
| `desktop` (1440×900) | `p0-landing-and-empty-state` | P0 | Landing page renders, Empty Workspace state works, and preset recovery restores studio | **PASS** | 1277 ms |
| `desktop` (1440×900) | `p0-core-multimodal-scrub-and-sonification` | P0 | Switch preset, scrub via buttons and keyboard arrows, and verify ARIA live readout & audio telemetry | **PASS** | 674 ms |
| `desktop` (1440×900) | `p0-export-4-layer-bundle` | P0 | Export standalone WCAG HTML widget, 16-bit PCM WAV track, tactile SVG, and JSON audit report | **PASS** | 954 ms |
| `desktop` (1440×900) | `p1-invalid-csv-and-auto-clean-recovery` | P1 | Detect malformed CSV lines/columns and recover in 1 click via Auto-Clean Invalid Rows | **PASS** | 665 ms |
| `desktop` (1440×900) | `p1-vision-modes-and-high-contrast-toggle` | P1 | Toggle Low-Vision High-Contrast (C key), CVD simulator modes, and chart geometries | **PASS** | 856 ms |
| `desktop` (1440×900) | `p1-custom-json-persistence-after-reload` | P1 | Author a custom JSON dataset and keep state across browser reload | **PASS** | 797 ms |
| `desktop` (1440×900) | `p2-responsive-and-touch-targets` | P2 | Verify zero horizontal overflow and >=44px touch targets on primary controls | **PASS** | 342 ms |
| `mobile` (390×844) | `p0-landing-and-empty-state` | P0 | Landing page renders, Empty Workspace state works, and preset recovery restores studio | **PASS** | 1326 ms |
| `mobile` (390×844) | `p0-core-multimodal-scrub-and-sonification` | P0 | Switch preset, scrub via buttons and keyboard arrows, and verify ARIA live readout & audio telemetry | **PASS** | 845 ms |
| `mobile` (390×844) | `p0-export-4-layer-bundle` | P0 | Export standalone WCAG HTML widget, 16-bit PCM WAV track, tactile SVG, and JSON audit report | **PASS** | 1091 ms |
| `mobile` (390×844) | `p1-invalid-csv-and-auto-clean-recovery` | P1 | Detect malformed CSV lines/columns and recover in 1 click via Auto-Clean Invalid Rows | **PASS** | 785 ms |
| `mobile` (390×844) | `p1-vision-modes-and-high-contrast-toggle` | P1 | Toggle Low-Vision High-Contrast (C key), CVD simulator modes, and chart geometries | **PASS** | 956 ms |
| `mobile` (390×844) | `p1-custom-json-persistence-after-reload` | P1 | Author a custom JSON dataset and keep state across browser reload | **PASS** | 720 ms |
| `mobile` (390×844) | `p2-responsive-and-touch-targets` | P2 | Verify zero horizontal overflow and >=44px touch targets on primary controls | **PASS** | 406 ms |

---

## 3. Issues Discovered During Stage 3 QA & Verified Fixes

During our initial Stage 3 QA execution (`10/14 passed` before fixes) and screenshot visual inspection, we caught **3 real defects** and resolved all of them before re-running the full regression suite:

### Issue QA-01 (Severity: P1 — State Persistence Failure on Browser Reload)
- **Scenario**: `p1-custom-json-persistence-after-reload`
- **Reproduction Steps**:
  1. Navigate to `2. CSV / JSON Data` tab.
  2. Enter custom title `"Community Clinic Vaccine Cold-Chain Uptime (%)"` and valid JSON array.
  3. Click `Validate & Render Dataset` and confirm the chart stage updates.
  4. Reload the browser page (`page.reload()`).
- **Expected vs. Actual**:
  - *Expected*: Custom dataset and user settings remain loaded after browser refresh.
  - *Actual (Before Fix)*: Page reset to the default `Global Solar & Wind Installed Capacity` preset (`Custom dataset state lost after page reload!`).
- **Fix Applied**: Added `localStorage` persistence (`sonochart_studio_state_v1`) in `src/App.tsx` saving `dataset`, `rawInputText`, `customTitle`, `chartType`, `scale`, `visionMode`, `highContrast`, and `tactilePatternsEnabled`.
- **Regression Result**: **PASSED** on both Desktop and Mobile (`evidence/stage-3-qa/screens/p1-custom-json-persistence-after-reload-persisted-after-reload-desktop.png`).

### Issue QA-02 (Severity: P1 — High-Contrast Button White-on-White Transition Flash in Firefox)
- **Scenario**: `p1-vision-modes-and-high-contrast-toggle`
- **Reproduction Steps**:
  1. Load studio in Firefox and press `C` to enable Low-Vision High-Contrast Mode (`data-high-contrast="true"`).
  2. Inspect button appearance immediately upon toggle.
- **Expected vs. Actual**:
  - *Expected*: Buttons immediately display dark `#121212` surface with `#FFFFFF` text (or `#00FF66` with `#0A0A0A` text).
  - *Actual (Before Fix)*: Because `.btn` had `transition: background-color 80ms linear` while `color` had no transition, `color` flipped to `#FFFFFF` at `0ms` while `background-color` remained near `#FFFFFF` during the 80ms transition, rendering unreadable white-on-white buttons in screenshots taken right after pressing `C`.
- **Fix Applied**:
  1. Updated `applyHighContrast` in `src/App.tsx` to synchronously set `document.documentElement.setAttribute('data-high-contrast', ...)`.
  2. Removed background transition lag on theme toggles in `src/styles.css` and added explicit `[data-high-contrast="true"]` button rules (`background-color: #121212; color: #FFFFFF; border-color: #FFFFFF;`) plus programmatic computed-style assertions in `qa/run.mjs`.
- **Regression Result**: **PASSED** on both Desktop and Mobile (`evidence/stage-3-qa/screens/p1-vision-modes-and-high-contrast-toggle-high-contrast-mode-desktop.png` and `...-mobile.png`).

### Issue QA-03 (Severity: P2 — Early Keypress Before SPA Mount)
- **Scenario**: `p1-vision-modes-and-high-contrast-toggle`
- **Observation**: When dispatching global keyboard shortcuts immediately after `domcontentloaded` before React hydrated `<div id="root">`, key events could fire before `window.addEventListener('keydown')` was registered.
- **Fix Applied**: Synchronized `applyHighContrast` on mount and ensured the test waits for the studio stage (`[data-testid="chart-stage-title"]`) to be visible before dispatching keyboard shortcuts.

---

## 4. First-Time User Experience & Visual Review

1. **5-Second Comprehension**: A first-time visitor immediately sees the tactile geometric-patterned SVG chart paired with the **NVDA/VoiceOver Contextual ARIA Live Readout** bar above it and the **Play Sonification (P) / Pitch Scrubber Deck** below it. The product purpose is unmistakable within 5 seconds.
2. **Zero-Guesswork Controls**: Every control includes an explicit text label and keyboard shortcut hint (`Play Sonification (P)`, `← Step Prev`, `Step Next →`, `High-Contrast Mode (C)`). There are zero unlabeled icon-only buttons.
3. **Actionable Error Recovery**: Entering malformed CSV rows (`Line 4: "2022,INVALID_NUMBER,899"`) highlights the exact line and column and provides a 1-click **`Auto-Clean Invalid Rows & Apply`** button that restores a valid chart immediately.
4. **Archetype Distinctiveness Check**: Does not resemble a generic SaaS dashboard — the archival paper palette, geometric hatch SVG fills, musical pitch/pan telemetry pills, and live screen-reader transcript strip are domain-specific to accessible data sonification.

---

## 5. Screenshot Evidence Index (`evidence/stage-3-qa/screens/`)

- `p0-landing-and-empty-state-landing-desktop.png` & `...-mobile.png`
- `p0-landing-and-empty-state-empty-state-desktop.png` & `...-mobile.png`
- `p0-core-multimodal-scrub-and-sonification-scrubbed-point-12-desktop.png` & `...-mobile.png`
- `p0-export-4-layer-bundle-exports-verified-desktop.png` & `...-mobile.png`
- `p1-invalid-csv-and-auto-clean-recovery-invalid-csv-error-desktop.png` & `...-mobile.png`
- `p1-invalid-csv-and-auto-clean-recovery-auto-cleaned-recovery-desktop.png` & `...-mobile.png`
- `p1-vision-modes-and-high-contrast-toggle-high-contrast-mode-desktop.png` & `...-mobile.png`
- `p1-custom-json-persistence-after-reload-persisted-after-reload-desktop.png` & `...-mobile.png`

---

## 6. Unverified Areas

- **Physical Hardware Screen Readers (JAWS / NVDA OS Desktop Binary / Apple VoiceOver Audio Output)**: Headless Playwright verifies the exact DOM `role="status"`, `aria-live="polite"`, `aria-atomic="true"` live region updates and keyboard focus/roving state, while OS-level screen-reader voice synthesis is outside headless browser scope.
