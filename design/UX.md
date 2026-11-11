# UX Contract — SonoChart Studio

> Fill this before writing UI code. It is the acceptance contract for the
> frontend: if the implementation does not match this file, the implementation
> is wrong. Keep it short and specific.

## 1. Product

- **One-liner**: Browser-native authoring studio that transforms raw CSV/JSON data into 4-layer accessible charts — combining spatial Web Audio sonification, tactile geometric SVG patterns, color-blind verified OKLCH palettes, and W3C/ADA Title II screen-reader data widgets.
- **Primary user**: STEM educators, university instructors, civic/nonprofit report authors, and data journalists publishing charts that must be accessible to blind, low-vision, and color-blind readers (WCAG 2.2 AA / ADA Title II).
- **Job to be done**: Take a tabular dataset (CSV/JSON or built-in civic/climate/health/STEM dataset), audit and experience it across visual, colour-blind, tactile-pattern, auditory, and screen-reader modalities, and export a self-contained accessible HTML widget, pattern-filled SVG, or 16-bit PCM `.wav` sonification track.
- **Core success action**: Scrub or play the multi-modal chart (hearing stereo pitch/timbre sonification + reading the synchronized ARIA screen-reader announcement) and click **"Export Accessible Bundle"** to generate the self-contained WCAG 2.2 HTML widget / `.wav` / `.svg`.
- **What the user should never have to guess**:
  1. Which data point is currently active, its exact rank (`"Point 4 of 12"`), its pitch frequency (`Hz` / musical note), stereo pan position (`L/R`), and statistical meaning (e.g., `Peak`, `Trough`, `Outlier`).
  2. How the chart looks to someone with Protanopia, Deuteranopia, Tritanopia, Achromatopsia, or Low-Vision High-Contrast mode.
  3. Whether the current chart passes WCAG 2.2 AA + APCA ($L_c \ge 60$) + non-color pattern distinguishability.

## 2. Core flow

| # | Step | User action | System feedback | Next step is obvious? |
|---|---|---|---|---|
| 1 | Load or select dataset | Pick one of 5 real-world civic/STEM presets (or paste/upload CSV/JSON, or click "Empty Slate") | Canvas renders tactile pattern SVG chart + computes W3C statistical summary, WCAG/APCA score, and acoustic pitch map within 50ms | Yes — transport bar & point scrubber highlight Point 1 with `[Play Sonification (P)]` CTA |
| 2 | Inspect & scrub multi-modal output | Press `Play (P / Space)` or use `← / →` arrow keys (or click any bar/node), toggle CVD / High-Contrast (`C`) / Chart Type / Scale | Plays Web Audio harmonic pitch + stereo pan + earcon cues, updates the **Synchronized Acoustic & Screen-Reader Scrubber Bar**, and announces `"Point k of N"` in the live ARIA transcript | Yes — live compliance checklist & primary **"Export Accessible Bundle"** button sit in the right action header/panel |
| 3 | Export verified accessible artifact | Click **"Export Accessible Bundle"** (choose Standalone WCAG HTML Widget, WAV Audio Track, Tactile SVG, or Compliance JSON Report) | Generates real downloadable `.html`, `.wav` (via `OfflineAudioContext`), `.svg`, or `.json` and shows a confirmation banner with byte size & verification hash | Yes — user can download or copy the embed snippet immediately |

Target: **≤ 3 steps** and **≤ 45 seconds** from landing to the core result.

## 3. Pages / Views

This is a single-workspace studio archetype (no marketing fluff pages, no multi-page maze).

| View / Workspace | Purpose | Primary action | Secondary actions |
|---|---|---|---|
| **Studio Workspace** (`/`) | Author, experience, audit, and export multi-modal accessible charts from CSV/JSON data | **Play / Scrub Multi-Modal Sonification & Export Accessible Bundle** | Switch dataset preset or upload/paste CSV/JSON; switch chart type (`Bar`, `Line`, `Multi-Series Comparison`, `Area`); change musical scale (`Pentatonic`, `Major`, `Chromatic`) & tempo; toggle vision simulation (`Normal`, `Deuteranopia`, `Protanopia`, `Tritanopia`, `Achromatopsia`, `Low-Vision High-Contrast [C]`); inspect/edit raw data & synchronized semantic HTML table |

One primary action hierarchy: the top studio bar houses dataset loading & the primary **"Export Accessible Bundle"** CTA; the central stage houses the **Tactile SVG Chart + Acoustic & Screen-Reader Timeline Scrubber** with the primary **"Play Sonification (P)"** transport trigger.

## 4. Required states

For the workspace and every interactive region:

- [x] **Empty / first visit**: Dedicated `"Clear / Empty Workspace"` trigger and empty-data state showing a guided dropzone with 1-click sample dataset buttons (`"Load Global Temperature Anomalies"`, `"Load Municipal Transit Accessibility"`, `"Paste CSV / JSON"`) so the user never stares at a blank screen.
- [x] **Loading**: Visible progress indicator with deterministic phase status (`"Synthesizing 16-bit PCM WAV via OfflineAudioContext..."` / `"Parsing & validating dataset..."`), disabled duplicate triggers, zero dead UI.
- [x] **Success**: Explicit confirmation banner with artifact details (e.g., `"Exported sonochart-climate-anomalies.wav (176.4 KB, 44.1 kHz Mono/Stereo PCM)"` or `"Loaded 12 rows × 2 series — 4/4 WCAG 2.2 AA & APCA checks passed"`).
- [x] **Error**: Clear human-readable error card stating what went wrong (e.g., `"Audio synthesis or file read failed"`) with a 1-click **"Reset to Verified Preset"** recovery action.
- [x] **Invalid input**: Inline validation on the CSV/JSON data editor pointing to the exact line/column error (e.g., `"Row 4 ('2023, N/A_bad'): Column 2 ('Solar_GW') must be a finite number. Fix line 4 or click 'Auto-Clean Non-Numeric Rows'."`).
- [x] **No permission / browser restriction state**: Explicit Web Audio autoplay-policy banner if the browser blocks `AudioContext` before user gesture, with a single click to unlock audio synthesis.
- [x] **Mobile 390px layout**: Stacked studio layout where the chart stage, transport/scrubber bar, vision mode selector, and export drawer are reachable with zero horizontal scrolling (`scrollWidth <= clientWidth`), and all interactive controls have touch targets `>= 44px`.

## 5. Design tokens

- **Font family and scale**:
  - Heading & UI Sans: `'Space Grotesk'`, `'Plus Jakarta Sans'`, system-ui, sans-serif (`--font-sans`)
  - Data, Acoustic Telemetry, Musical Pitch & ARIA Code Mono: `'IBM Plex Mono'`, `'JetBrains Mono'`, monospace (`--font-mono`)
  - Scale: `12px` (telemetry/badges), `14px` (body/table/controls), `16px` (section headers/ARIA readout), `20px` (chart title), `26px` (studio header title)
- **Spacing scale**: `4px`, `8px`, `12px`, `16px`, `24px`, `32px` (high-density precision studio grid with `1px` structural hairlines)
- **Colors (Tactile Risograph & Brailliant Studio Palette — Daylight Default + High-Contrast Low-Vision Mode)**:
  - Background Primary (Warm Archival Paper): `#F6F4EE`
  - Background Surface / Panel: `#EFECE4`
  - Elevated Stage Surface: `#FFFFFF`
  - Structural Hairline Border: `#D5D0C3` (Strong border: `#181816`)
  - Text Primary (Deep Carbon Ink): `#141413` (APCA $L_c > 95$ on `#F6F4EE`)
  - Text Muted (Slate Graphite): `#4A4944` (WCAG AA $> 7.2:1$ on `#F6F4EE`)
  - Accent Primary (International Signal Cobalt — Series A / Primary CTA): `#0047AB` (WCAG AAA $8.1:1$ on white)
  - Accent Secondary (Vermilion Tactile Amber — Series B / Playhead / Outlier): `#C83E00` (WCAG AA $5.4:1$ on white; distinct under Protanopia/Deuteranopia when paired with Cobalt + geometric hatch pattern)
  - Accent Tertiary (Deep Teal Pine — Series C / Verified Pass): `#0B6E4F`
  - Danger / Invalid Input: `#B42318` (Background `#FEF3F2`)
  - Low-Vision High-Contrast Override (`[data-high-contrast="true"]`, toggled via `C` key): Background `#0A0A0A`, Surface `#121212`, Text `#FFFFFF`, Active Highlight `#00FF66`, Series strokes `#FFFFFF` / `#FFD600` / `#00E5FF` with bold SVG geometric hatch patterns (`2.5px` stroke).
- **Radius and borders**: Crisp architectural geometry — `4px` on buttons/inputs, `6px` on studio panels, `1px solid #D5D0C3` structural grid borders (and `2px solid #141413` active focus rings). No puffy `24px` pill cards or blurry drop shadows.
- **Button and input height**: Minimum `44px` height (`min-height: 44px; min-width: 44px`) on all buttons, inputs, tabs, and scrubber controls for WCAG 2.5.5 / 2.5.8 motor accessibility.
- **Icon style and stroke**: Inline precision SVG icons with `1.75px` stroke width, always paired with visible text labels (zero unlabeled icon-only buttons).

## 6. References

| Reference (URL or product) | What to borrow | What not to copy |
|---|---|---|
| **[Highcharts Sonification Studio](https://sonification.highcharts.com/)** | Combined chart canvas + audio mapping controls (pitch, pan, tempo) in a single-screen workbench | Cluttered multi-tab accordion menus; lack of contextual `"Point k of N"` screen-reader readout ([Issue #28](https://github.com/highcharts/sonification-studio/issues/28)) |
| **[Datawrapper](https://www.datawrapper.de/)** | Built-in color-blindness check bar and clean editorial typography on charts | Multi-step wizard that forces 4 separate page reloads before export; lack of audio sonification and tactile SVG patterns |
| **[Teenage Engineering / Ableton Live Session View](https://www.ableton.com/)** | High-contrast tactile transport bar, real-time frequency (`Hz` / note) + stereo pan (`L/R`) telemetry strip, crisp `1px` grid borders | Music-producer jargon that would confuse an educator or civic data journalist |

## 7. Mobile

- **390px layout**: Single-column vertical stack (`grid-template-columns: 1fr`) with sticky top studio header (`Export Bundle` + `Preset Selector`), followed by the responsive SVG Chart Stage, tactile `Play / Step ← / Step →` transport controls (`>= 44px` height), synchronized Screen-Reader Live Transcript bar, and tabbed bottom inspector (`Data & CSV`, `Acoustic Mapping`, `Vision & WCAG Audit`).
- **Primary action reachable without horizontal scroll**: Yes — `Play Sonification` and `Export Accessible Bundle` are both visible above the fold at `390×844` with `overflow-x: hidden` and verified `scrollWidth <= clientWidth`.
- **What is collapsed or hidden**: Secondary acoustic envelope sliders and the raw CSV text editor collapse into clean switchable inspector tabs below the chart stage on `< 960px` viewports so the chart and scrubber remain immediately usable.
- **Keyboard behavior**: Full keyboard operability (`←` / `→` steps through data points and plays their pitch/pan note; `Home` / `End` jumps to first/last point; `P` or `Space` toggles play/pause on the chart stage; `C` toggles Low-Vision High-Contrast mode).

## 8. Visual direction

- **Three adjectives**: **Tactile, Acoustic, Archival-Precision**
- **Product archetype**: **Canvas + Audio/Accessibility Inspector Studio** (`editor / canvas`)
- **Palette and why it fits the domain**: Warm archival paper (`#F6F4EE`) paired with deep carbon ink (`#141413`), signal cobalt (`#0047AB`), and vermilion (`#C83E00`) evokes printed Braille/tactile diagrams, scientific cartography, and precision acoustic instrumentation. It avoids eye-straining pure-white glare in default mode while offering an instant 1-key (`C`) **Black/Neon-Green/White Low-Vision High-Contrast mode** directly addressing [MAIDR Issue #361](https://github.com/xability/maidr/issues/361).
- **Type pairing (max 2 families)**: `Space Grotesk` (geometric, legible headers and UI controls) + `IBM Plex Mono` (tabular numerals, `Hz` frequency readouts, musical notes, stereo pan indices, and ARIA screen-reader transcript output).
- **Density**: **Dense (Precision Studio)** — puts the tactile SVG chart, live acoustic pitch/pan scrubber, screen-reader announcement banner, and vision-deficiency simulator in one unified viewport with zero marketing bloat.
- **Signature element (one thing this product owns)**: **The Tri-Modal Synchronized Scrubber & Tactile SVG Stage** — a dual-deck canvas where every data mark is simultaneously rendered with **geometric SVG hatch patterns** (for tactile/color-blind separation), linked to a **real-time Web Audio harmonic pitch/pan synthesizer strip** (`C4 · 261.6 Hz · Pan -0.45L`), and paired with a **live NVDA/VoiceOver Screen-Reader Announcement Bar** (`"Point 4 of 12 — 2019: 580 GW (+19.6%, Peak Outlier)"`).
- **Motion rules**: Playhead scrubber cursor and active SVG bar/node highlight transition smoothly (`80ms linear`); decorative background animations, floating blobs, or bouncing cards are strictly forbidden (`prefers-reduced-motion` respected).
- **Rejected clichés**: No purple/blue dark-mode SaaS gradient background, no glassmorphism cards, no 3-column marketing hero section, no generic KPI dashboard sidebar, no emoji icons, no Lorem ipsum.

**Generic test:** Could this first screen be dropped into any other SaaS product without looking out of place? **No** — the geometric hatch-patterned SVG data marks, synchronized musical note / `Hz` / stereo pan telemetry strip, CVD vision simulation matrix bar, and live ARIA screen-reader announcement transcript unmistakably identify it as an accessible data sonification & tactile chart studio.

## 9. UX acceptance

- [x] A first-time user can explain the product's purpose within 5 seconds
- [x] The core task is reachable from the landing page without reading docs
- [x] Every action produces visible feedback within 100ms, or a loading state
- [x] Every error says what happened and what to do next
- [x] Empty states are actionable, not blank
- [x] No dead ends; no unlabeled icon-only buttons
- [x] Desktop and mobile screenshots reviewed side by side
- [x] The flow still works after connecting the real backend / computation & audio synthesis engine
