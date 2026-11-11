# Stage 3 QA Scenarios — SonoChart Studio

## Environment Targets
- **Deployed Production URL**: `https://georgefifth.github.io/sonochart-studio/`
- **Local Production Preview URL**: `http://127.0.0.1:4173/`
- **Viewports**:
  - Desktop: `1440×900` (`deviceScaleFactor: 1`)
  - Mobile: `390×844` (`deviceScaleFactor: 2`)

---

## Prioritized Scenario List

### P0 — Core Task & Blocker Scenarios
1. **`p0-landing-and-empty-state`** (First Visit, Empty Workspace & Preset Recovery)
   - Verify landing page renders with zero horizontal overflow (`scrollWidth <= innerWidth + 1`).
   - Click `Clear Workspace` (`[data-testid="btn-empty-state"]`) and verify the guided Empty Workspace card appears with actionable preset buttons.
   - Click `Load Global Solar & Wind Installed Capacity` from the empty state and confirm the SVG chart, W3C statistical summary, and WCAG 100/100 score badge are restored.
2. **`p0-core-multimodal-scrub-and-sonification`** (End-to-End Multi-Modal Scrubbing & Audio Telemetry)
   - Load the `Global Surface Temperature Anomaly` preset.
   - Verify the chart title, W3C summary headline, and synchronized data table update to `12 rows`.
   - Step forward using `Step Next →` and keyboard `ArrowRight` / `ArrowLeft` / `End` / `Home`.
   - Assert that the NVDA/VoiceOver contextual live region (`[data-testid="sr-live-transcript"]`) updates deterministically to `"Point k of 12"`, and acoustic telemetry pills (`PITCH`, `STEREO PAN`, `TIMBRE`, `EARCON`) update synchronously.
3. **`p0-export-4-layer-bundle`** (Real Artifact Downloads: `.HTML`, `.WAV`, `.SVG`, `.JSON`)
   - Open `3. Export Bundle` tab.
   - Trigger downloads for:
     1. Standalone WCAG `.HTML` Widget
     2. Spatial Audio `.WAV` (16-Bit PCM)
     3. Tactile Pattern `.SVG` Vector
     4. WCAG 2.2 + APCA Audit `.JSON`
   - Assert each download completes, verify file extensions and non-zero byte sizes, and verify the status banner confirms the export.

### P1 — Major Friction, Error Handling, Persistence & Accessibility Scenarios
4. **`p1-invalid-csv-and-auto-clean-recovery`** (Malformed Input Validation & 1-Click Auto-Clean)
   - Open `2. CSV / JSON Data` tab.
   - Click `Test Malformed CSV Input` (`[data-testid="btn-load-invalid-csv"]`).
   - Assert `[data-testid="validation-error-box"]` is visible and explicitly identifies `Line 4` (`INVALID_NUMBER`) and `Line 5` (`MISSING_VAL`), and the status banner shows `[ERROR]`.
   - Click `Auto-Clean Invalid Rows & Apply` (`[data-testid="btn-auto-clean-csv"]`) and assert the error box disappears, status banner switches to `[SUCCESS]`, and the chart renders the 3 valid rows.
5. **`p1-vision-modes-and-high-contrast-toggle`** (CVD Simulation, Tactile SVG Patterns & `C` Key High-Contrast)
   - Press keyboard shortcut `C` (and click `High-Contrast Mode (C)`) to toggle Low-Vision High-Contrast mode (`data-high-contrast="true"`).
   - Switch Vision Simulator (`[data-testid="select-vision-mode"]`) across `deuteranopia`, `protanopia`, `tritanopia`, and `achromatopsia`.
   - Switch Chart Geometry (`[data-testid="select-chart-type"]`) across `multi-bar`, `line`, `area`, and `bar`.
   - Assert WCAG 2.2 AA & APCA compliance score remains `100/100` while tactile SVG patterns are enabled.
6. **`p1-custom-json-persistence-after-reload`** (Custom Authoring & State Persistence Across Page Reload)
   - Open `2. CSV / JSON Data` tab, enter a custom title `"Community Clinic Vaccine Cold-Chain Uptime (%)"` and valid JSON array dataset, and click `Validate & Render Dataset`.
   - Reload the browser page (`page.reload()`).
   - Assert that the custom dataset title `"Community Clinic Vaccine Cold-Chain Uptime (%)"` and its rows persist after reload without losing user work.

### P2 — Ergonomics, Touch Targets & Responsive Layout Checks
7. **`p2-responsive-and-touch-targets`** (Mobile 390px Ergonomics & WCAG 2.5.8 Target Size)
   - Verify zero horizontal overflow on both `1440×900` and `390×844`.
   - Verify primary action buttons (`Play Sonification (P)`, `Export Accessible Bundle (.HTML)`) have bounding box height `>= 42px` and visible text labels (zero unlabeled icon-only buttons).
