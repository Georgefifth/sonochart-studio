# Stage 4 — Technical Presentation, Slides & Demo Video Report

## 1. Overview & Production Pipeline

We authored and rendered a **1080p30 H.264 Technical Presentation & Live Product Demo Video** (`evidence/stage-4-demo/demo.mp4`, **83.21 seconds**, **11 MB**) using `~/tools/demo-recorder` (Remotion + React SVG + Playwright Live Capture + `edge-tts` Neural Narration + Frame-Accurate Subtitles + Sidechain-Ducked `cyber-pulse` BGM).

### Source & Exported Artifacts (`evidence/stage-4-demo/` & `planning/`)
- **Fact Registry**: `project/facts.json` (4 verified claims backed by Stage 2/3/3.5 evidence; 1 unverified claim explicitly blocked from appearing in video narration or text).
- **Narration Script**: `planning/script.md` (7 scenes, `<= 3.2` words/sec pacing, highlighted technical terms and real metrics).
- **Data-Driven Remotion Storyboard**: `planning/storyboard.json`
- **Custom Vector Technical Diagrams**:
  - `evidence/stage-4-demo/slides/slide-01-opening.svg` (4-Layer Multi-Modal Studio Schematic)
  - `evidence/stage-4-demo/slides/slide-03-architecture.svg` (4-Layer Client-Side Pipeline Stack)
- **Live Deployed Browser Captures (`https://georgefifth.github.io/sonochart-studio/`)**:
  - `evidence/stage-4-demo/slides/live_demo_scrub.png`
  - `evidence/stage-4-demo/slides/live_demo_high_contrast.png`
  - `evidence/stage-4-demo/slides/live_demo_repair_export.png`
  - `evidence/stage-4-demo/9fcba2b33da385cc264de3980bb1b1c9.webm` (Raw Playwright live interaction recording)
- **Individual 1080p30 Scene Renders (`evidence/stage-4-demo/scenes/`)**:
  - `01-opening.mp4` (`1.8 MB`)
  - `02-problem.mp4` (`1.5 MB`)
  - `03-architecture.mp4` (`1.6 MB`)
  - `04-live_demo_scrub.mp4` (`2.9 MB`)
  - `05-live_demo_repair_export.mp4` (`2.6 MB`)
  - `06-validation.mp4` (`1.3 MB`)
  - `07-closing.mp4` (`1.1 MB`)
- **Final Master 1080p30 Video with Sidechain BGM**:
  - `evidence/stage-4-demo/demo.mp4` (`1920×1080`, `30 FPS`, `H.264 + AAC 160kbps`, `83.21s`, `11 MB`)

---

## 2. Scene-by-Scene Visual Architecture & Fact Traceability

| Scene # | Scene ID | Visual Archetype (`visual_type`) | Visual Structure (Zero Wall-of-Text) | Verified Facts & Stage 3.5 Data Used |
|---|---|---|---|---|
| **01** | `opening` | `opening_title` | Split hero with bespoke 4-layer vector schematic (`slide-01-opening.svg`) and animated reticle on the NVDA/VoiceOver `"Point 4 of 11"` bar | `fact_multimodal_4layer` (WCAG 2.2 AA, APCA $L_c \ge 60$, 44.1 kHz Stereo PCM WAV) |
| **02** | `problem` | `problem_flow` | Animated 4-node bottleneck flowchart (`Static Canvas` → `Blind Nav Blocked` → `Color-Only Series` → `Manual Alt-Text Wall`) | `fact_competitor_fixes` (Highcharts #28, Chart2Music #689, MAIDR #361) |
| **03** | `architecture` | `exploded_view` | 4-layer isometric exploded assembly (`RFC 4180 Parser` → `OLS Regression & W3C Summary` → `Tactile SVG & Machado CVD` → `Spatial Web Audio & WAV`) | `fact_multimodal_4layer`, `fact_competitor_fixes` (`4.6ms` avg parse latency) |
| **04** | `live_demo_scrub` | `real_footage_with_annotations` | Live capture of `https://georgefifth.github.io/sonochart-studio/` with timed HUD callouts and right-hand 2-step sequence tracker | `fact_multimodal_4layer`, `fact_stage3_qa` (`Point 4 of 11`, `+23.5%`, `E3 164.8 Hz`, `-0.34L`) |
| **05** | `live_demo_repair_export` | `real_footage_with_annotations` | Live capture showing Line 4/5 malformed CSV detection, 1-click `Auto-Clean Invalid Rows & Apply`, and 4-layer bundle export | `fact_stage3_qa`, `fact_stage35_validation` |
| **06** | `validation` | `technical_validation` | Animated horizontal benchmark bars (`100% vs 41.7%`, `100% vs 80%`, `100% vs 71.4%`) + explicit Scope Boundaries panel | `fact_stage35_validation` (12/12 Validation + 5/5 Hold-Out + 14/14 Firefox QA) |
| **07** | `closing` | `closing_summary` | Architectural summary cards displaying live GitHub Pages URL, repository URL, and final `PASS` verdict | `fact_multimodal_4layer`, `fact_stage3_qa`, `fact_stage35_validation` |

---

## 3. Visual QA & Frame Inspection Log (`evidence/stage-4-demo/frames/`)

We extracted 1080p PNG frames from every scene (`01-opening.png` through `07-closing.png`) and inspected each frame visually:
1. **Defect Caught & Fixed in `02-problem.png`**:
   - *Initial Frame Check*: The callout pill above Node 3 (`"MAIDR #361: Multi-Series Collapse in High-Contrast"`) was 50 characters long and clipped at the pill boundary; Node 2's title (`"Lost Screen-Reader Context"`) touched the right border of the node box.
   - *Fix Applied*: Shortened Node 2 to `"Blind Nav Blocked"`, Node 3 to `"Color-Only Series"`, and the pill callout to `"High-Contrast Collapse"`. Re-rendered `02-problem.mp4` and verified zero text clipping in `evidence/stage-4-demo/frames/02-problem.png`.
2. **Defect Caught & Fixed in `04-live_demo_scrub.png` & `05-live_demo_repair_export.png`**:
   - *Initial Frame Check*: Using `"type": "zoom"` scaled the inner screenshot by `1.38×`, cropping the outer edges of the studio interface.
   - *Fix Applied*: Changed the second animation in Scenes 4 and 5 from `"zoom"` to `"label"`, keeping 100% of the live browser viewport visible while pointing directly to the target control via an animated leader line. Re-rendered and verified in `04-live_demo_scrub.png` and `05-live_demo_repair_export.png`.
