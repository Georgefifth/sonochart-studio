# SonoChart Studio

**Multi-Modal Accessible Data Visualization & Sonification Authoring Studio**  
*Built for the [Code for Change](https://code-for-change-global.devpost.com/) Global Hackathon*

---

## Problem & Why It Matters

Millions of charts published in STEM education, municipal reports, public health notices, and civic journalism are exported as silent images or color-dependent canvases.
- **Blind and screen-reader users** cannot perceive trends, extrema, or anomalies from static charts or generic 1-line `alt` tags.
- **Color-blind readers (~300M globally)** cannot distinguish multi-series charts that rely on color alone (violating **WCAG 1.4.1 Use of Color**).
- **Public schools, universities, and municipalities** face strict legal mandates under **ADA Title II (effective 2026)** and **WCAG 2.2 Level AA** to provide accessible complex data visualizations.

Existing open-source and web tools have documented accessibility and workflow gaps:
1. **[Highcharts Sonification Studio Issue #28](https://github.com/highcharts/sonification-studio/issues/28)**: Stepping through graph elements lacks contextual screen-reader position (`"Point k of N"`) and unified play/pause keyboard bindings.
2. **[Chart2Music Issue #689](https://github.com/julianna-langston/chart2music/issues/689)**: Modern NVDA browse mode intercepts arrow keys unless roving controls and live regions are properly structured.
3. **[MAIDR Issue #361](https://github.com/xability/maidr/issues/361)**: Lacks a single-key (`C`) Low-Vision High-Contrast mode that preserves multi-series differentiation via geometric tactile patterns.

---

## What SonoChart Studio Does

**SonoChart Studio** is a 100% browser-native, zero-backend authoring workbench that transforms raw `.csv` or `.json` datasets into a **4-layer accessible data bundle** in under 30 seconds:

1. **Spatial Web Audio Sonification Engine**:
   - Maps data values to harmonic musical scales (`C Major Pentatonic`, `C Diatonic Major`, `12-Tone Chromatic`) from `C3` to `C6`.
   - Maps X-axis progression to stereo panning (`-0.85 L` to `+0.85 R`) with distinct instrument timbres per series (`Triangle`, `Marimba`, `Sine`) and harmonic earcon chimes on statistical peaks and troughs.
   - Synthesizes downloadable **44.1 kHz 16-bit Stereo PCM `.wav`** audio files directly in browser memory.
2. **Tactile Geometric SVG Patterns & Color-Vision Simulator**:
   - Automatically pairs high-contrast palette tokens with unique geometric `<pattern>` fills (`diagonal-hatch`, `cross-hatch`, `dot-matrix`, `vertical-bars`) and distinct node markers (`circle`, `diamond`, `square`, `triangle`).
   - Built-in **Machado et al. (2009)** physiological Color-Vision Deficiency simulator (`Deuteranopia`, `Protanopia`, `Tritanopia`, `Achromatopsia`) and 1-key (`C`) **Low-Vision High-Contrast Mode**.
3. **W3C WAI Complex-Image Statistical Summary & Contextual ARIA Live Scrubber**:
   - Deterministically computes ordinary least-squares (OLS) linear regression slope, $R^2$, mean, median, IQR, Z-score anomalies, and net percentage change.
   - Emits real-time `"Point k of N"` contextual screen-reader announcements (`role="status"`, `aria-live="polite"`) synchronized with an accessible HTML `<table>`.
4. **One-Click Self-Contained Accessible Bundle Export**:
   - **`.HTML` Widget**: Zero-dependency WCAG 2.2 AA interactive chart widget containing the patterned SVG, inline Web Audio synthesizer, keyboard navigation, and data table.
   - **`.WAV` Track**: 44.1 kHz 16-bit Stereo PCM audio recording of the dataset.
   - **`.SVG` Vector**: Standalone vector chart with embedded geometric hatch patterns.
   - **`.JSON` Report**: Full WCAG 2.2 AA + APCA ($L_c$) + CIE76 $\Delta E$ compliance certificate.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `P` | Play / Pause full spatial sonification timeline |
| `←` / `→` | Step backward / forward point-by-point with stereo pitch & ARIA readout |
| `Home` / `End` | Jump to first / last data point |
| `C` | Toggle Low-Vision High-Contrast Mode (`#0A0A0A` canvas + neon tactile strokes) |

---

## Local Development & Verification

```bash
npm install
npm test          # Run Vitest unit & engine suite
npm run build     # Run TypeScript check + production Vite build
npm run preview   # Preview production bundle locally
```

## License

MIT
