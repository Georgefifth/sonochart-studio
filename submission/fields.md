# Devpost Submission Fields — SonoChart Studio

---

## 1. Project name

```text
SonoChart Studio
```

---

## 2. Elevator pitch (182 / 200 characters)

```text
Browser-native workbench turning CSV/JSON data into 4-layer accessible charts: spatial Web Audio sonification, tactile SVG patterns, CVD palettes, and WCAG 2.2 AA screen-reader HTML.
```

---

## 3. Thumbnail

Upload file: `submission/assets/00-thumbnail.png` (`1200×800`, 3:2 ratio, `114.5 KB`, custom-generated project poster PNG).

---

## 4. About the project (Copy & Paste Markdown)

````markdown
## Inspiration

Millions of charts published in STEM courses, municipal reports, public health notices, and civic journalism are exported as silent images or color-only `<canvas>` elements. For blind students using screen readers, a complex time-series chart is often reduced to a generic one-line `alt` attribute; for the ~300 million people globally with Color Vision Deficiency (CVD), multi-series charts that rely on color alone violate **WCAG 1.4.1 (Use of Color)**. Meanwhile, public schools, universities, and municipalities face strict legal mandates under **ADA Title II** and **WCAG 2.2 Level AA** to make complex data visualizations accessible.

When we audited existing open-source and web sonification tools during our research phase, we uncovered three specific, documented gaps in their GitHub issue trackers:
1. **Lost Positional Context in Screen Readers** ([Highcharts Sonification Studio Issue #28](https://github.com/highcharts/sonification-studio/issues/28)): Stepping through graph elements lacked contextual `"Point k of N"` position announcements and unified keyboard playback controls.
2. **Broken Arrow-Key Navigation in NVDA Browse Mode** ([Chart2Music Issue #689](https://github.com/julianna-langston/chart2music/issues/689)): Modern screen readers intercept arrow keys unless roving controls and `aria-live="polite"` status regions are properly structured.
3. **Multi-Series Collapse in Low-Vision High-Contrast Mode** ([MAIDR Issue #361](https://github.com/xability/maidr/issues/361)): Turning all series white on a black canvas without geometric hatch patterns causes multi-series plots to become indistinguishable.

We built **SonoChart Studio** to solve all three problems in a single 30-second, zero-cloud browser workflow.

## What it does

**SonoChart Studio** is a 100% browser-native authoring workbench that transforms raw `.csv` or `.json` datasets into a **4-layer accessible data bundle**:

1. **Spatial Web Audio Sonification Engine**:
   - Quantizes numeric data values to harmonic musical scales (`C Major Pentatonic`, `C Diatonic Major`, or `12-Tone Chromatic`) across three octaves (`C3` at `130.8 Hz` to `C6` at `1046.5 Hz`).
   - Maps X-axis progression to stereo panning (`-0.85 L` to `+0.85 R`) with distinct instrument timbres per series (`Triangle`, `Marimba`, `Sine`) and harmonic earcon chimes on statistical peaks and troughs.
   - Synthesizes downloadable **44.1 kHz 16-bit Stereo PCM `.wav`** audio files directly in browser memory with zero server uploads.
2. **Tactile Geometric SVG Patterns & Color-Vision Simulator**:
   - Pairs high-contrast palette tokens with four unique geometric `<pattern>` definitions (`diagonal-hatch`, `cross-hatch`, `dot-matrix`, `vertical-bars`) and four distinct node marker geometries (`circle`, `diamond`, `square`, `triangle`).
   - Includes a real-time physiological **Machado et al. (2009)** Color-Vision Deficiency simulator (`Deuteranopia`, `Protanopia`, `Tritanopia`, `Achromatopsia`) and a single-key (`C`) **Low-Vision High-Contrast Mode** (`#0A0A0A` canvas with neon `#00FF66` and `#FFD600` patterned strokes).
3. **W3C WAI Complex-Image Statistical Summary & Contextual ARIA Live Scrubber**:
   - Deterministically calculates ordinary least-squares (OLS) linear regression slope, `R^2`, mean, median, interquartile range (`IQR = Q3 - Q1`), Z-score (`z = (x - mean) / stdDev`) anomalies, and net percentage change.
   - Emits real-time `"Point k of N"` contextual screen-reader announcements (`role="status"`, `aria-live="polite"`) synchronized with an interactive semantic `<table>`.
4. **One-Click Self-Contained Accessible Bundle Export**:
   - **Standalone `.HTML` Widget**: Zero-dependency WCAG 2.2 AA interactive chart embed containing the patterned `<svg>`, inline Web Audio synthesizer, keyboard navigation, W3C statistical summary, and `<table>`.
   - **Spatial `.WAV` Track**: 44.1 kHz 16-bit Stereo PCM audio recording of the dataset.
   - **Tactile `.SVG` Vector**: Standalone vector chart with embedded `<pattern>` definitions.
   - **Compliance `.JSON` Report**: Full WCAG 2.2 AA luminance contrast, APCA perceptual contrast (`Lc >= 60`), and pairwise `Delta E` audit certificate.

## How we built it

- **Frontend & Visual Architecture**: Built with **TypeScript**, **React 18**, and **Vite** using an archival-precision studio aesthetic (warm archival paper `#F6F4EE` paired with deep carbon ink `#141413`, signal cobalt `#0047AB`, and vermilion `#C83E00`, plus `Space Grotesk` and `IBM Plex Mono` typography).
- **Deterministic Tabular Parser (`src/engine/dataParser.ts`)**: Implements an RFC 4180 quote-aware CSV tokenizer, automatic delimiter detection (`,`, `;`, `\t`), UTF-8 BOM stripping, automatic categorical metadata column filtering, exact line/column error diagnostics, and a 1-click **Auto-Clean Invalid Rows** recovery engine.
- **Statistical & Perceptual Math (`src/engine/statistics.ts`, `src/engine/colorAccessibility.ts`)**: Implements OLS linear regression, quartile interpolation, WCAG 2.2 relative luminance contrast (`(L1 + 0.05) / (L2 + 0.05)`), APCA-W3 perceptual contrast (`Lc`), CIE76 Lab `Delta E`, and Machado (2009) `3x3` RGB simulation matrices.
- **Web Audio & RIFF/WAVE Encoder (`src/engine/sonifier.ts`)**: Combines real-time `AudioContext` + `StereoPannerNode` synthesis with a deterministic in-memory 44-byte `RIFF`/`WAVE` 16-bit stereo PCM encoder.

## Challenges we ran into

1. **Real-World Messy CSV & JSON Formats**: When we tested our initial parser against external datasets from NOAA, NASA GISTEMP, World Bank, and Vega Datasets (`gapminder-health-income.csv`, `cars.json`, `barley.json`), our initial validation pass rate was `66.7%` (`8/12`). Quoted country names containing commas (`"Congo, Dem. Rep."`), European semicolon delimiters (`;`), intermediate ISO string columns (`ABW`), and JSON objects with numeric first keys caused failures. We engineered an RFC 4180 quote-aware tokenizer, categorical column detector, and JSON key promoter, bringing our post-fix validation pass rate to `100%` (`12/12` validation + `5/5` untouched hold-out datasets).
2. **Preventing Adversarial XSS in Self-Contained HTML Widget Exports**: During adversarial testing with `<script>` payloads inside CSV labels, we discovered that while HTML table cells were escaped, embedding raw `JSON.stringify()` inside an inline `<script>` block could leave unescaped `<script>` sequences. We hardened `src/engine/exporter.ts` by encoding `<` and `>` as `\u003c` and `\u003e` inside inline JSON literals.
3. **Eliminating High-Contrast CSS Transition Lag in Firefox**: Real-browser QA in headless Firefox revealed that an `80ms` CSS background transition caused buttons to briefly appear white-on-white immediately after pressing the `C` shortcut. Removing theme transition lag and synchronizing the `data-high-contrast` root attribute fixed the issue across both Desktop (`1440x900`) and Mobile (`390x844`) viewports.

## Accomplishments that we're proud of

- **14 / 14 End-to-End Browser QA Scenarios Passed**: Verified in headless Firefox across Desktop (`1440x900`) and Mobile (`390x844`) on both our live deployed GitHub Pages site and local build with zero console or page errors.
- **100% Real-World & Hold-Out Dataset Validation (`4.6ms` avg parse latency)**: Validated across 12 real-world, edge, negative, and adversarial cases plus 5 untouched Vega hold-out datasets (`us-employment.csv`, `disasters.csv`, `barley.json`, `cars.json`, `budget.json`), outperforming the `chart2music` v1.x baseline (`100%` vs `41.7%` end-to-end task completion).
- **70%+ Reduction in Authoring Steps**: Replaces a 9–12 step workflow across 3–4 separate tools with a 3-step, 30-second browser studio that outputs `.html`, `.wav`, `.svg`, and `.json` artifacts simultaneously.

## What we learned

- Accessibility cannot be a single-modality afterthought: a chart that is accessible to a blind screen-reader user via Web Audio and ARIA still fails a low-vision or color-blind reader unless geometric SVG `<pattern>` fills and APCA contrast are engineered into the same rendering pipeline.
- Testing against real external datasets early exposes structural edge cases (such as 10-digit population numbers requiring compact `1.49B` SI axis formatting and dense X-axis label striding) that synthetic unit tests miss.

## What's next for SonoChart Studio

- **Braille Embosser & Tactile Graphics Export**: Adding direct export to `.brf` (Braille Ready Format) and swell-paper tactile graphic templates for classroom Braille embossers.
- **LMS & Civic CMS Embed Plugins**: One-click oEmbed and Canvas/Moodle LMS blocks so teachers can drop interactive SonoChart widgets directly into course assignments.
````

---

## 5. Built with (Tags)

```text
typescript, react, vite, web-audio-api, svg, accessibility, wcag, html5, css3, playwright, vitest, github-pages
```

---

## 6. "Try it out" links

- **Live Deployed Web App**: `https://georgefifth.github.io/sonochart-studio/`
- **GitHub Repository**: `https://github.com/Georgefifth/sonochart-studio`

---

## 7. Image gallery & Captions (<= 150 characters each)

Upload the following 6 images from `submission/assets/` in order (all verified `PNG`, exact `3:2` aspect ratio, `< 400 KB` each):

1. **File**: `submission/assets/01-gallery-studio-default.png`
   - **Caption (116 chars)**:
     ```text
     SonoChart Studio workbench: tactile SVG hatch patterns, spatial Web Audio scrubber, and contextual Point k-of-N bar.
     ```
2. **File**: `submission/assets/02-gallery-high-contrast-mode.png`
   - **Caption (114 chars)**:
     ```text
     1-key (C) Low-Vision High-Contrast mode (#0A0A0A canvas) preserving multi-series geometric SVG hatch patterns.
     ```
3. **File**: `submission/assets/03-gallery-invalid-csv-recovery.png`
   - **Caption (112 chars)**:
     ```text
     RFC 4180 parser pinpointing exact line/column CSV errors with 1-click Auto-Clean Invalid Rows recovery action.
     ```
4. **File**: `submission/assets/04-gallery-realworld-gapminder.png`
   - **Caption (117 chars)**:
     ```text
     Real-world Vega Gapminder dataset: quoted commas, SI billions Y-axis formatting, and auto-computed W3C data summary.
     ```
5. **File**: `submission/assets/05-gallery-4layer-architecture.png`
   - **Caption (110 chars)**:
     ```text
     Four-layer client-side architecture: RFC 4180 parser, OLS stats, tactile SVG/CVD matrix, and 16-bit WAV synth.
     ```
6. **File**: `submission/assets/06-gallery-benchmark-validation.png`
   - **Caption (115 chars)**:
     ```text
     Stage 3.5 real-world validation: 100% pass rate across 17 NOAA, NASA & Vega datasets vs 41.7% Chart2Music baseline.
     ```

---

## 8. Video link

- **Local Rendered 1080p30 Master Video**: `submission/assets/demo.mp4` (`1920×1080`, `30 FPS`, `83.21s`, `11 MB`)
- **Video URL Field**: `TODO(human)` — Upload `submission/assets/demo.mp4` to YouTube (Unlisted or Public) or Vimeo, then paste the public video URL into the Devpost "Video link" field.
