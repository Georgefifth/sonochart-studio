# Stage 1 Research & Direction Selection — Code for Change

## 0. Hackathon Context & Constraints (Verified Facts)

- **Hackathon**: [Code for Change](https://code-for-change-global.devpost.com/) ([Rules](https://code-for-change-global.devpost.com/rules))
- **Organizer**: HackathonForEveryone
- **Deadline**: December 1, 2026 @ 5:00pm PST (8:00pm EST)
- **Theme**: *"Build a practical technology project that helps people, communities, or the planet. Whether you focus on education, accessibility, health, climate, community connection, or another meaningful challenge, create something useful, thoughtful, and ready to share."*
- **Judging Criteria**:
  1. **Impact**: How meaningfully the project addresses a real-world problem and benefits people, communities, or the planet.
  2. **Originality**: How creative and distinctive the idea, approach, or solution is.
  3. **Technical Execution**: How well the project is built, including functionality, quality, and appropriate use of technology.
  4. **Usability / Presentation**: How clearly the project, demo, usability, and its value are communicated.

---

## 1. Phase 1: Market Exploration & Reference Analysis

### 1.1 Devpost Winning Reference Projects (Studied as Reference, Not Proof of Market Viability)
We examined past Devpost winning projects in the accessibility and social-good categories:
- **[The Blind Architect's Simulation](https://devpost.com/software/the-blind-architect-s-simulation)** — Acoustic/spatial simulation for visually impaired navigation. *Takeaway*: Interactive Web Audio feedback makes accessibility problems immediately tangible to judges, but pure simulations lack daily utility unless paired with an authoring/export workflow.
- **[LyfeLine](https://devpost.com/software/lyfeline)** & **[SafeNight](https://devpost.com/software/safenight-nrqwpo)** — Community safety and crisis response apps. *Takeaway*: Many hackathon crisis apps fail in the real world because they require cold-start network effects or live cellular connectivity during emergencies.
- **[Polaris](https://devpost.com/software/polaris-b0joci)** & **[re-check](https://devpost.com/software/re-check)** — Assistive verification and workflow tools. *Takeaway*: Browser-native tools that accept real user files and produce an immediate, compliant artifact consistently score highest in Technical Execution and Impact.

### 1.2 Directions Investigated & Eliminated Early (Disconfirming Evidence)
Before selecting our 6 candidate directions, we actively looked for disconfirming evidence and eliminated ideas already well-solved by mature free tools:
- **Eliminated Idea A — General Web Page WCAG DOM Scanner**: Already thoroughly solved by [axe-core](https://github.com/dequelabs/axe-core), Chrome Lighthouse, and [WAVE](https://wave.webaim.org/). Building another URL DOM linter adds zero competitive value.
- **Eliminated Idea B — Generic AI Text Summarizer / Flashcard Generator for Students**: Saturated by ChatGPT, NotebookLM, and Anki plugins; also violates the principle of not forcing AI where deterministic tools or existing free products already win.
- **Eliminated Idea C — Food-Bank / Mutual-Aid Two-Sided Marketplace**: Requires local cold-start liquidity and live backend moderation; a single user or judge cannot experience real end-to-end value on day one.

---

## 2. Phase 2: Candidate Directions (6 Distinct Candidates)

---

### Candidate 1: **SonoChart Studio** — Multi-Modal Accessible Data Visualization & Sonification Authoring Studio (Accessibility + STEM Education / Civic Publishing)

- **Target Users & Concrete Pain Points**:
  - STEM teachers, university instructors, nonprofit/civic report authors, and data journalists who publish charts for audiences that include blind, low-vision, and color-blind readers, or who must comply with **ADA Title II (effective April 2026 for US public schools/universities/municipalities)** and **WCAG 2.2 AA**.
  - **Pain Point**: Standard charts exported from Excel, Chart.js, or Canva are opaque pixels or untagged `<canvas>`/`<svg>` elements. Blind students cannot hear trends or navigate data points via keyboard; color-blind readers cannot distinguish series; and authors have no way to generate a single accessible bundle containing **Web Audio pitch/pan sonification + interactive ARIA keyboard navigation + tactile SVG pattern fills + synchronized WCAG data table + structured natural-language statistical summary**.
- **Current Workflow**:
  - Authors paste a static PNG chart and manually write a 1-sentence `alt` tag (`"Chart showing temperatures rising"`), which fails ADA Title II / WCAG 1.1.1 requirements for complex images. Or developers write custom Python/R code using specialized libraries.
- **Existing Products & Links**:
  1. **[Chart2Music](https://github.com/julianna-langston/chart2music)** — Open-source JS library turning charts into audio.
  2. **[MAIDR (Multimodal Access and Interactive Data Representation)](https://github.com/xability/maidr)** — Research library for accessible charts.
  3. **[Highcharts Sonification Studio](https://sonification.highcharts.com/)** — Web tool by Highcharts & Georgia Tech.
- **Deficiencies of Existing Solutions & Verified Evidence**:
  - **Chart2Music** breaks under modern screen readers and raw SVGs: see [Issue #689: Latest NVDA prevents the keyboard navigation along the data points](https://github.com/julianna-langston/chart2music/issues/689), [Issue #565: Some keyboard actions are unavailable on a Mac](https://github.com/julianna-langston/chart2music/issues/565), and [Issue #18: Doesn't work with directly embedded raw SVG](https://github.com/julianna-langston/chart2music/issues/18).
  - **MAIDR** is developer-centric and lacks built-in low-vision high-contrast toggles or non-programmer authoring: see [Issue #361: Support high-Contrast Color Mode Toggle for Low-Vision Users](https://github.com/xability/maidr/issues/361) and [Issue #814: Chart type coverage roadmap](https://github.com/xability/maidr/issues/814).
  - **Highcharts Sonification Studio** exports audio/MIDI or proprietary Highcharts configs, **not** a self-contained WCAG-compliant HTML/SVG accessible widget with tactile SVG hatch patterns, ARIA grid keyboard navigation, and automated W3C WAI complex-image long descriptions.
- **Concrete Improvements We Provide**:
  - Zero-code browser studio where a teacher, researcher, or civic publisher drops a CSV/JSON dataset (or edits inline) and immediately generates, tests, and exports a **4-layer accessible data artifact**:
    1. **Interactive Web Audio Sonification Engine**: Maps data series to stereo pan (X-axis), musical scale / frequency pitch (Y-axis), timbre (sine/triangle/marimba per series), and earcon alerts for outliers/min/max, playable continuously or point-by-point via arrow keys.
    2. **Color-Vision & Tactile Pattern SVG Renderer**: Simultaneously applies geometric SVG hatch/dot/stripe patterns + OKLCH APCA high-contrast palettes verified under Protanopia, Deuteranopia, Tritanopia, and Achromatopsia simulators.
    3. **W3C WAI Complex-Image Summary & Screen-Reader Live Region**: Deterministically computes trend slopes, min/max, anomalies, IQR/mean, and emits an ARIA-roving-tabindex keyboard navigator + linked semantic `<table>`.
    4. **One-Click Self-Contained Export**: Exports standalone accessible HTML embed (with inline Web Audio + ARIA keyboard navigation), SVG with pattern fills, WAV audio track of the sonification, and WCAG 2.2 compliance audit certificate.
- **Why Users Would Switch**:
  - Replaces 3 separate tools (chart builder + manual alt-text writer + audio sonification tool) with a 30-second browser workflow that outputs a deploy-ready, self-contained accessible embed and WAV audio file.
- **Development Difficulty, Risks & Feasibility**:
  - **Difficulty**: Medium. Uses browser-native Web Audio API (`OfflineAudioContext` for instant WAV export + `AudioContext` for live point-by-point scrubbing), SVG pattern defs, and deterministic statistical analysis.
  - **Risk**: Audio synthesis can sound harsh if raw frequencies are used; mitigated by quantizing to pentatonic/major musical scales with ADSR envelopes and stereo panning.
- **MVP Scope & Validation Method**:
  - **MVP**: Dataset import (CSV/JSON + 5 real-world civic/climate/health/education presets), multi-series chart builder (bar, line, scatter/anomaly, stacked), interactive keyboard + audio scrubber, CVD (color blindness) & screen-reader simulator, and export to WAV + standalone accessible HTML/SVG.
  - **Stage 3.5 Validation**: Benchmark 10 real civic/STEM datasets against standard Chart.js/static exports on WCAG 2.2 AA criteria, APCA contrast ratios, colour-blind ΔE distinguishability under Machado 2009 simulation matrices, and keyboard/screen-reader completeness.
- **Fact / Inference / Assumption Separation**:
  - *Verified Fact*: Chart2Music (#689) and MAIDR (#361) have documented accessibility and usability gaps; US ADA Title II mandates WCAG 2.1/2.2 AA compliance for public educational and municipal digital content by 2026.
  - *Reasonable Inference*: Non-technical educators and civic data publishers prefer a zero-install browser studio that exports self-contained HTML/SVG/WAV over Python/JS coding libraries.
  - *Unverified Assumption*: Authors will embed the interactive HTML snippet or WAV file alongside static charts in their LMS/CMS.
- **5-Dimension Scoring**:
  - **Practical Value (9/10)**: Directly solves ADA Title II / WCAG 1.1.1 complex-chart accessibility for educators and civic orgs.
  - **Innovation (9/10)**: Unifies Web Audio musical sonification, tactile SVG pattern geometry, CVD simulation, and ARIA roving-tabindex navigation in one client-side studio.
  - **Competitive Advantage (8.5/10)**: Neither Chart2Music, MAIDR, nor Datawrapper exports a self-contained HTML+WAV+Pattern-SVG bundle without code.
  - **UX (9/10)**: Immediate multisensory feedback (sight + sound + keyboard) makes both daily use and judge evaluation compelling.
  - **Feasibility (9.5/10)**: 100% deterministic client-side Web Audio + SVG + Canvas; zero external API dependencies.

---

### Candidate 2: **CaptionCraft SDH** — Deaf & Hard-of-Hearing (SDH) Caption Compliance & Rhythm Studio (Accessibility + Media / Education Creators)

- **Target Users & Concrete Pain Points**:
  - Educators recording lecture videos, nonprofit advocacy filmmakers, and independent creators publishing captioned videos who must meet **WCAG 1.2.2 / FCC / Netflix & BBC SDH (Subtitles for the Deaf and Hard-of-Hearing)** standards.
  - **Pain Point**: Auto-generated SRT/VTT files from Whisper or YouTube have unreadable reading speeds (>20–30 characters per second), awkward line breaks that split noun phrases ("the / hospital"), missing speaker-turn prefixes, and zero timing cushion around shot/pause boundaries.
- **Current Workflow**:
  - Creators either upload raw Whisper SRTs that Deaf/HoH and neurodivergent viewers struggle to read, pay $1.50–$3.00/minute for manual caption compliance, or install Windows-only desktop software.
- **Existing Products & Links**:
  1. **[Subtitle Edit](https://github.com/SubtitleEdit/subtitleedit)** — Popular open-source subtitle editor (14.9k stars).
  2. **[Hyperaudio Lite Editor](https://github.com/hyperaudio/hyperaudio-lite-editor)** — Browser transcript/caption tool.
  3. **[Amara](https://amara.org/)** / **[HappyScribe](https://www.happyscribe.com/)** — Commercial web subtitle editors.
- **Deficiencies of Existing Solutions & Verified Evidence**:
  - **Subtitle Edit** is Windows/.NET WinForms only; macOS/Linux/Chromebook educators cannot run it natively ([Issue #81: Port to MacOS — 63 comments](https://github.com/SubtitleEdit/subtitleedit/issues/81)).
  - **Hyperaudio & Auto-Caption Generators** lack deterministic reading-speed and timing-safeguard enforcement ([Hyperaudio Issue #343: Improve caption generation: reading-speed limits, timing safeguards, and configurability](https://github.com/hyperaudio/hyperaudio-lite-editor/issues/343)).
  - **Commercial cloud tools (HappyScribe/Kapwing/VEED)** require uploading large private videos to paid servers and do not provide one-click deterministic linguistic line-splitting + CPS (Characters Per Second) auto-rebalancing against BBC/Netflix/FCC accessibility profiles.
- **Concrete Improvements We Provide**:
  - 100% local browser studio (accepts local `.mp4`/`.webm`/`.wav` + `.srt`/`.vtt`) with:
    1. **Multi-Standard SDH Compliance Engine**: Audits every cue against BBC (17 CPS), Netflix SDH (17 CPS child / 20 CPS adult, ≤42 chars/line, ≤2 lines), and WCAG/FCC standards.
    2. **Linguistic Phrase-Aware Line Splitter & Timing Rebalancer**: Automatically splits over-length cues at natural grammatical boundaries (conjunctions, punctuation, prepositions) and extends micro-gaps dynamically without overlapping adjacent cues.
    3. **SDH Acoustic Tag & Speaker Studio**: Quick-insert bar for Deaf/HoH non-speech audio descriptors (`[upbeat music]`, `[siren wailing]`, `[applause]`, `[inaudible]`) with WebVTT positioning/color styling per speaker.
    4. **Dual SRT + Styled WebVTT + QC Compliance Report Export**.
- **Why Users Would Switch**:
  - Turns a chaotic raw Whisper `.srt` into a broadcast-compliant SDH `.vtt`/`.srt` in under 60 seconds in any browser, with zero video upload and zero subscription cost.
- **Development Difficulty, Risks & Feasibility**:
  - **Difficulty**: Medium. Requires accurate SRT/WebVTT AST parser, waveform canvas renderer via Web Audio API, and deterministic grammatical line-break + CPS timing solver.
  - **Risk**: Re-timing cues when speech has zero pauses cannot lower CPS without condensing words; mitigated by flagging "speech-rate bottleneck cues" with specific condensation suggestions.
- **MVP Scope & Validation Method**:
  - **MVP**: Local video/audio + SRT/VTT loader, waveform timeline + CPS heatmap, one-click Auto-Remediate (line wrapping, cue splitting, gap normalization), SDH non-speech tagger, and SRT/VTT/JSON QC export.
  - **Stage 3.5 Validation**: Test on 15 real raw Whisper/YouTube auto-generated SRT files and measure before/after violation counts across CPS (>20 CPS), CPL (>42 chars/line), orphan words, and micro-flash cues (<833ms).
- **Fact / Inference / Assumption Separation**:
  - *Verified Fact*: Raw ASR subtitles frequently exceed 22–28 CPS and break lines arbitrarily; Subtitle Edit has a long-standing macOS/web gap (#81).
  - *Reasonable Inference*: Educators and nonprofit media teams using Whisper locally or via YouTube need a fast post-processor for SDH accessibility.
  - *Unverified Assumption*: Users already have a raw `.srt`/`.vtt` file ready to import rather than expecting in-browser ASR transcription of 1-hour videos.
- **5-Dimension Scoring**:
  - **Practical Value (8.5/10)**: Solves a daily bottleneck for accessible educational and civic video publishing.
  - **Innovation (7.5/10)**: Rule-based grammatical cue splitting + CPS rebalancing is genuinely useful, though subtitle editors as a category are familiar.
  - **Competitive Advantage (8/10)**: Zero-upload, cross-platform browser SDH compliance vs. Windows-only Subtitle Edit or paid SaaS.
  - **UX (8.5/10)**: Visual CPS timeline heatmap + instant before/after video preview.
  - **Feasibility (9/10)**: Clean client-side implementation.

---

### Candidate 3: **CivicPlain Studio** — Plain-Language & Neuro-Inclusive Document Remediator for Healthcare, IEP & Civic Guides (Health / Education / Civic Equity)

- **Target Users & Concrete Pain Points**:
  - Community health workers writing patient discharge instructions, special-education teachers drafting IEP (Individualized Education Program) parent summaries, legal-aid clinics, and municipal clerks writing public benefit guides.
  - **Pain Point**: Official public health, legal, and educational documents average a 12th–16th grade reading level, whereas the NIH, AMA, and US Plain Writing Act recommend a **6th–8th grade reading level**. Existing readability checkers only output a static Flesch-Kincaid number without providing domain-specific medical/civic plain-language replacements, structural screen-reader hierarchy checks, or dyslexia/ADHD-friendly print/HTML exports.
- **Current Workflow**:
  - Writers paste text into Hemingway App (which highlights whole sentences in red/yellow without offering medical/civic terminology replacements) or paste sensitive patient/student text into cloud LLMs (raising HIPAA/FERPA privacy issues).
- **Existing Products & Links**:
  1. **[Hemingway Editor](https://hemingwayapp.com/)** — Commercial readability highlighter ($19.99 desktop / $10/mo AI).
  2. **[write-good](https://github.com/btford/write-good)** & **[retext-readability](https://github.com/retextjs/retext-readability)** — Open-source prose linters.
  3. **[textstat](https://github.com/textstat/textstat)** — Python readability metrics library.
- **Deficiencies of Existing Solutions & Verified Evidence**:
  - **write-good** is unmaintained and triggers naive false positives ([Issue #139: Is this still maintained?](https://github.com/btford/write-good/issues/139), [Issue #138: Do not suggest avoiding the transitive verb 'is'](https://github.com/btford/write-good/issues/138)).
  - **Hemingway Editor** does not include curated **CDC Everyday Words for Public Health Communication** or **Federal Plain Language Guidelines** lexicons, does not audit document structure (heading hierarchy, action-item callouts, numeric vs. word ratios for dyscalculia/dyslexia), and charges a subscription for rewrites.
- **Concrete Improvements We Provide**:
  - Privacy-first, 100% local browser studio that combines:
    1. **Multi-Formula Readability & Cognitive Load Diagnostics**: Flesch-Kincaid Grade, SMOG Index (gold standard for healthcare materials), Gunning Fog, Coleman-Liau, passive voice, clause depth, and abstract-noun density.
    2. **Built-in CDC Medical + Federal Civic + Special-Ed IEP Plain-Language Lexicon**: Interactive inline chips that replace complex medical/legal/bureaucratic terms (e.g., *"hypertension"* → *"high blood pressure"*, *"utilize"* → *"use"*, *"subsequent to"* → *"after"*, *"contraindicated"* → *"unsafe to take with"*) with one click.
    3. **Neuro-Inclusive & Screen-Reader Document Formatter**: Transforms dense walls of text into structured chunked layouts with semantic headings, "What You Need To Do" checklists, bionic/syllable-spaced reading views, and accessible print/HTML export.
- **Why Users Would Switch**:
  - Zero HIPAA/FERPA cloud leakage (runs 100% locally), provides actionable 1-click CDC/Federal plain-language replacements instead of passive red highlights, and exports a patient/parent-ready accessible handout.
- **Development Difficulty, Risks & Feasibility**:
  - **Difficulty**: Medium-Low. Deterministic NLP tokenization, syllable counting, SMOG/FK formulas, and a curated 600+ term CDC/Federal/IEP plain-language replacement dictionary.
  - **Risk**: Deterministic dictionary + syntax splitting cannot rewrite deeply convoluted legal paragraphs automatically without human editing; mitigated by side-by-side interactive clause splitter and live grade-level delta meter.
- **MVP Scope & Validation Method**:
  - **MVP**: Split-pane editor with live SMOG/Flesch-Kincaid grade meter, 1-click CDC/Federal jargon replacement chips, sentence-split assistant, cognitive-load checklist, and accessible Patient/Civic Handout HTML/Print export.
  - **Stage 3.5 Validation**: Evaluate 12 real public-domain hospital discharge notices, municipal benefit forms, and IEP procedural safeguards before and after remediation, measuring SMOG grade reduction, syllable density reduction, and WCAG structural compliance.
- **Fact / Inference / Assumption Separation**:
  - *Verified Fact*: NIH/AMA recommend 6th–8th grade reading levels for patient materials; CDC publishes a public-domain *Everyday Words for Public Health Communication* thesaurus; `write-good` has maintenance and false-positive issues (#138, #139).
  - *Reasonable Inference*: Clinics, schools, and legal-aid groups value a local-first tool that never sends drafts to third-party servers.
  - *Unverified Assumption*: Users will accept deterministic phrase replacements and guided sentence splitting over paid cloud LLM rewrites.
- **5-Dimension Scoring**:
  - **Practical Value (8.5/10)**: High real-world utility for health equity, special education, and civic access.
  - **Innovation (7/10)**: Domain-specific CDC/Civic interactive thesaurus + SMOG/cognitive-load formatter is practical, though text linters are well-known.
  - **Competitive Advantage (7.5/10)**: Beats Hemingway Free by offering 1-click domain replacements and accessible handout export.
  - **UX (8.5/10)**: Clean editorial split-screen with instant grade-level drop feedback.
  - **Feasibility (9.5/10)**: Highly reliable client-side execution.

---

### Candidate 4: **GreenByte Auditor** — Web Sustainability, Digital Carbon & Low-Bandwidth Inclusion Workbench (Climate + Digital Equity)

- **Target Users & Concrete Pain Points**:
  - Frontend engineers, civic tech maintainers, NGO webmasters, and students building web apps that must minimize digital carbon emissions and remain usable on 2G/3G networks in rural or Global South communities.
  - **Pain Point**: Existing carbon calculators like WebsiteCarbon only accept a live public URL and return a single opaque number (`"0.42g CO2 per visit"`) based solely on total transfer bytes, giving developers zero asset-by-asset remediation plan or offline HAR/bundle inspection.
- **Current Workflow**:
  - Developers paste a deployed URL into WebsiteCarbon.com or Ecograder, get a vanity badge, and still have to manually dig through Chrome DevTools Network/Coverage tabs to figure out what is bloating page weight and energy usage.
- **Existing Products & Links**:
  1. **[CO2.js by The Green Web Foundation](https://github.com/thegreenwebfoundation/co2.js)** — Open-source JS library implementing the Sustainable Web Design Model (SWDM).
  2. **[Website Carbon Calculator](https://www.websitecarbon.com/)** / **[Ecograder](https://ecograder.com/)** — URL-based carbon estimators.
- **Deficiencies of Existing Solutions & Verified Evidence**:
  - **CO2.js** is a headless npm calculation library whose byte-proxy assumptions and SWDM v4 segment breakdowns confuse developers without visual asset attribution ([Issue #138: The use of data as a proxy in the Sustainable Web Design model](https://github.com/thegreenwebfoundation/co2.js/issues/138), [Issue #295: SWDM v4 segments differ from total with green hosting](https://github.com/thegreenwebfoundation/co2.js/issues/295)).
  - **WebsiteCarbon / Ecograder** cannot inspect local pre-deployment HTML/CSS/JS/Image bundles or exported Chrome DevTools `.har` files, and do not model regional grid carbon intensity (gCO2/kWh) alongside 3G/satellite load-time accessibility for rural communities.
- **Concrete Improvements We Provide**:
  - An interactive browser workbench powered by SWDM v4 math + regional electricity grid intensity data where developers drop a `.har` network archive, HTML/SVG/CSS/JS bundle, or resource manifest and get:
    1. **SWDM v4 Segment Breakdown**: Operational vs. Embodied emissions across Data Centers, Networks, and User Devices across 30+ global electricity grids.
    2. **What-If Remediation Simulator**: Toggle AVIF/WebP image compression, font subsetting, dead-JS tree-shaking, caching headers, and Green Hosting migration to see exact kg CO2/year saved and 3G Rural Load Time saved.
    3. **Exportable `green-budget.json` CI Policy & SVG Sustainability Report**.
- **Why Users Would Switch**:
  - Works pre-deployment on local `.har` files and asset bundles, tying environmental sustainability directly to low-bandwidth rural digital inclusion.
- **Development Difficulty, Risks & Feasibility**:
  - **Difficulty**: Medium-Low.
  - **Risk**: Because browser CORS blocks arbitrary cross-origin URL crawling without a proxy, live URL scanning works only for CORS-enabled endpoints or uploaded `.har`/HTML/asset files.
- **MVP Scope & Validation Method**:
  - **MVP**: HAR / asset bundle inspector, SWDM v4 calculator with grid intensity map, interactive remediation simulator, and CI budget exporter.
  - **Stage 3.5 Validation**: Run against 10 real HAR captures from civic, educational, and news websites to quantify byte, kWh, CO2e, and 3G load-time reductions.
- **Fact / Inference / Assumption Separation**:
  - *Verified Fact*: SWDM v4 is the W3C Sustainable Web Interest Group / Green Web Foundation standard; `co2.js` issues #138 and #295 highlight transparency gaps in byte-proxy and segment calculations.
  - *Reasonable Inference*: Combining environmental carbon budget with rural 3G load-time equity makes sustainability actionable for engineering teams.
  - *Unverified Assumption*: Users are willing to export a `.har` file from DevTools or paste HTML/asset manifests when CORS prevents direct cross-origin scraping.
- **5-Dimension Scoring**:
  - **Practical Value (7.5/10)**: Useful for green web auditing, though less urgent for non-developers than accessibility tools.
  - **Innovation (7.5/10)**: Connecting SWDM v4 carbon segments with rural low-bandwidth equity simulation.
  - **Competitive Advantage (7.5/10)**: Beats single-number URL calculators via HAR-level interactive remediation.
  - **UX (8/10)**: Clear treemap + what-if sliders.
  - **Feasibility (9/10)**: Clean client-side math, though CORS limits arbitrary URL fetching.

---

### Candidate 5: **ChromaGuard APCA** — Perceptual Contrast (WCAG 2.2 + APCA) & Color-Blind Safe Design System Remediator (Accessibility + Design / Dev Tooling)

- **Target Users & Concrete Pain Points**:
  - UI designers and frontend engineers building public-facing web apps who discover their CSS variables / Tailwind palettes fail WCAG 2.2 AA/AAA or WCAG 3.0 draft **APCA (Accessible Perceptual Contrast Algorithm)**, or become indistinguishable to the ~300 million people globally with Color Vision Deficiency (CVD).
- **Current Workflow**:
  - Manually checking pairs one by one in WebAIM Contrast Checker, then guessing hex codes by dragging an RGB slider until a pair passes—which destroys hue harmony and breaks dark mode.
- **Existing Products & Links**:
  1. **[Adobe Leonardo](https://github.com/adobe/leonardo)** — Contrast-based color generator (2.1k stars).
  2. **[APCA-W3](https://github.com/Myndex/apca-w3)** — Perceptual contrast calculator.
  3. **[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)** — Single foreground/background checker.
- **Deficiencies of Existing Solutions & Verified Evidence**:
  - **Adobe Leonardo** has steep onboarding complexity and open bugs: [Issue #299: Generated colors can be slightly below the requested contrast ratio](https://github.com/adobe/leonardo/issues/299), [Issue #178: Background color cannot be changed](https://github.com/adobe/leonardo/issues/178), and [Issue #179: Theme URL error/won't load](https://github.com/adobe/leonardo/issues/179).
  - **WebAIM** only checks 1 pair at a time and does not auto-remediate an existing `.css` or `tailwind.config.js` file in perceptual OKLCH space while preserving hue and checking CVD confusion pairs.
- **Concrete Improvements We Provide**:
  - Paste any existing `.css` (`:root` variables), Tailwind palette, or design tokens JSON → instantly runs a full N×N matrix audit for **WCAG 2.2 (4.5:1 / 3:1) + APCA ($L_c$ 60/75/90) + Machado 2009 CVD ΔE distinguishability** → auto-solves the nearest passing color in **OKLCH perceptual space** (locking hue $H$ and adjusting lightness $L$ / chroma $C$ minimally) → previews on live civic/healthcare UI components → exports a drop-in patched `.css` / JSON diff.
- **Why Users Would Switch**:
  - Instead of creating a palette from scratch in Adobe Leonardo, developers paste their *existing* broken CSS variables and get a mathematically minimal, hue-preserving accessible patch in 5 seconds.
- **Development Difficulty, Risks & Feasibility**:
  - **Difficulty**: Medium-Low. Exact OKLCH color science, WCAG 2.x relative luminance, APCA-W3 formula, and Machado CVD matrices.
  - **Risk**: Color contrast tools are a crowded space on GitHub (`swatchly-color`, `color-scorer`), so a standalone color tool risks feeling like a developer utility rather than a high-impact social-good product.
- **MVP Scope & Validation Method**:
  - **MVP**: CSS/JSON token parser, WCAG 2.2 + APCA matrix, CVD simulator, OKLCH binary-search auto-fixer, and patched CSS diff exporter.
  - **Stage 3.5 Validation**: Audit and auto-fix 10 real open-source CSS themes and verify 100% WCAG AA + APCA $L_c \ge 60$ compliance with minimal ΔE hue drift.
- **Fact / Inference / Assumption Separation**:
  - *Verified Fact*: Adobe Leonardo has open contrast-rounding and state bugs (#299, #178, #179); WCAG 2.x luminance frequently misjudges dark-mode contrast compared to APCA.
  - *Reasonable Inference*: Developers want a drop-in CSS variable fixer rather than a blank-slate palette generator.
  - *Unverified Assumption*: Hackathon judges in a "Code for Change" social-good competition will weigh a developer CSS color tool as highly on "Social Impact" as an end-user accessibility or civic/health tool.
- **5-Dimension Scoring**:
  - **Practical Value (8/10)**: Genuinely time-saving for frontend developers.
  - **Innovation (6.5/10)**: OKLCH + APCA auto-fixing already has several recent small open-source implementations.
  - **Competitive Advantage (7/10)**: Direct CSS variable diffing beats single-pair checkers, but crowded niche.
  - **UX (8.5/10)**: Very visual before/after UI preview.
  - **Feasibility (9.5/10)**: Pure math, zero external dependencies.

---

### Candidate 6: **AAC BoardSmith** — Offline-First Printable & Interactive Bilingual AAC Communication Board Studio for Speech Therapy & Special Ed (Accessibility + Health / Education)

- **Target Users & Concrete Pain Points**:
  - Speech-Language Pathologists (SLPs), special-education teachers, ICU nurses (for intubated/non-verbal patients), and parents of non-speaking autistic or post-stroke individuals.
  - **Pain Point**: Creating a customized **Augmentative and Alternative Communication (AAC)** board tailored to a child's classroom routine or an ICU patient's immediate needs currently requires either expensive proprietary software (Boardmaker at $99–$199/year, TouchChat at $299) or clunky web apps that fail offline, have broken login/blank-screen bugs, and cannot cleanly export both a **high-contrast laminated print PDF/SVG** (essential for low-tech bedside/classroom boards) and an **offline interactive Web Speech TTS board**.
- **Current Workflow**:
  - Teachers and SLPs screenshot symbols into Google Slides or MS Word tables, manually align borders and Fitzgerald Key color-coding (Yellow = Pronouns/People, Green = Verbs, Blue = Adjectives, Orange = Nouns, Pink = Social/Emergency), and print misaligned pages—or struggle with cloud AAC apps.
- **Existing Products & Links**:
  1. **[Cboard](https://github.com/cboard-org/cboard)** — Open-source browser AAC board (767 stars).
  2. **[OpenBoard Format (OBF)](https://www.openboardformat.org/)** — Open standard for AAC boards.
  3. **[Boardmaker (Tobii Dynavox)](https://goboardmaker.com/)** — Commercial industry standard ($99–$199/yr).
- **Deficiencies of Existing Solutions & Verified Evidence**:
  - **Cboard** suffers from persistent blank-screen spinners, login walls for customization, scroll bugs on large boards, and lack of Fitzgerald Key color-coding helpers: see [Issue #1871: Black screen with spinner](https://github.com/cboard-org/cboard/issues/1871), [Issue #1847: "Wrong email or password" error](https://github.com/cboard-org/cboard/issues/1847), [Issue #1786: Disable scroll for large boards](https://github.com/cboard-org/cboard/issues/1786), and [Issue #89: Proof read machine translations](https://github.com/cboard-org/cboard/issues/89).
  - **Boardmaker** costs $99–$199/yr per seat, locking out underfunded public schools, families in developing regions, and volunteer clinics.
- **Concrete Improvements We Provide**:
  - Zero-login, offline-capable **Dual-Mode AAC Studio** (Interactive TTS + Print-Ready Laminated Sheet Generator):
    1. **Automatic Fitzgerald Key Linguistic Color-Coding**: Automatically colors and organizes tiles by part-of-speech (Pronouns, Verbs, Descriptors, Nouns, Social/Urgent, Questions) following clinical SLP motor-planning standards so core vocabulary stays in consistent spatial positions.
    2. **Bilingual Label + Web Speech TTS + Switch-Scanning Mode**: Supports dual-language labels (e.g., English + Spanish / Mandarin / French / Arabic) on every tile, natural sentence-strip builder with one-tap speak/clear/backspace, and **1-Switch / 2-Switch Keyboard Auto-Scanning** (Space/Enter scanning loop for users with severe motor impairments like ALS or cerebral palsy).
    3. **Clinical Templates + OpenBoard (`.obf`) & High-DPI Print Sheet Export**: Built-in templates for Pediatric Classroom Core 24/36, Hospital ICU Bedside Pain & Needs Scale, and Emergency First-Responder Communication, exporting both `.obf` (OpenBoard standard) and print-ready cut/laminate sheets.
- **Why Users Would Switch**:
  - Zero login wall, instant switch-scanning accessibility for motor impairments, automatic Fitzgerald Key clinical color-coding, and 1-click dual export (live interactive TTS board + printable bedside/classroom sheet).
- **Development Difficulty, Risks & Feasibility**:
  - **Difficulty**: Medium. Requires curated vector clinical pictogram library, Fitzgerald Key POS mapping, Web Speech API synthesis with visual sentence strip, configurable switch-scanning timer/keyboard loop, and `.obf` + print layout engine.
  - **Risk**: Browser `window.speechSynthesis` voices vary by OS; mitigated by visual + Web Audio confirmation tones alongside Web Speech API and full printable sheet output.
- **MVP Scope & Validation Method**:
  - **MVP**: Clinical template loader (Classroom Core, Hospital ICU, Emergency), tile editor with automatic Fitzgerald Key color coding, bilingual label toggle, interactive Sentence Strip + Switch-Scanning mode, and `.obf` + Print Sheet export.
  - **Stage 3.5 Validation**: Validate exported `.obf` files against the OpenBoard Format JSON schema specification, verify WCAG AAA contrast & minimum target sizes (WCAG 2.5.8 / motor accessibility), and benchmark layout/creation task steps vs. manual table formatting.
- **Fact / Inference / Assumption Separation**:
  - *Verified Fact*: Cboard has documented stability, login, and layout issues (#1871, #1847, #1786); Boardmaker charges $99–$199/yr; Fitzgerald Key color-coding and OpenBoard Format (`.obf`) are established clinical AAC standards.
  - *Reasonable Inference*: SLPs, teachers, and hospital staff benefit from a zero-account tool that produces both an interactive switch-scannable board and a printable laminated sheet.
  - *Unverified Assumption*: Curated built-in vector pictograms + custom SVG/image upload will cover 90% of immediate classroom and ICU communication scenarios without requiring a 50,000-icon server database.
- **5-Dimension Scoring**:
  - **Practical Value (9/10)**: Directly empowers non-speaking individuals, SLPs, special-ed classrooms, and ICU patients.
  - **Innovation (8/10)**: Combines automatic Fitzgerald Key motor-planning layout, bilingual tiles, switch-scanning, and OpenBoard `.obf` + print-ready export in one zero-login web app.
  - **Competitive Advantage (8.5/10)**: Solves Cboard's login/spinner friction and Boardmaker's paywall while adding switch-scanning and print layout.
  - **UX (9/10)**: Tactile, high-contrast Fitzgerald Key visual identity that is unmistakably purpose-built (not a generic SaaS dashboard).
  - **Feasibility (9/10)**: 100% browser-native with deterministic `.obf` schema validation.

---

## 3. Phase 3: Strict Product Critique & Elimination

As a strict product reviewer, we subjected all 6 candidates to the 6 mandatory critique questions:

### Critique of Candidate 1: **SonoChart Studio** (Multi-Modal Accessible Data Visualization & Sonification Studio)
1. **Does this product truly need to exist?** Yes. Millions of charts published in STEM courses, municipal reports, and journalism are inaccessible to blind, low-vision, and color-blind users, and ADA Title II now legally mandates WCAG 2.1/2.2 AA compliance for public institutions.
2. **Why can't existing tools solve it?** Chart.js/Excel output silent visual canvases; Chart2Music has broken NVDA navigation (#689) and requires JS coding; Highcharts Sonification Studio does not output a self-contained WCAG HTML widget with tactile SVG hatch patterns, ARIA data tables, and W3C complex-image statistical descriptions.
3. **Is there a simpler, cheaper, non-AI solution?** Yes — our design is **100% deterministic, non-AI, and free**: it uses mathematical statistics (linear regression slope, IQR, min/max/outlier detection), Web Audio synthesis, OKLCH + Machado CVD matrices, and SVG geometric pattern fills. No LLM API is needed or used.
4. **Will users try it once and abandon it?** No, for educators and civic analysts who publish new charts weekly, it serves as a repeatable publishing step (CSV in → Accessible HTML + SVG + WAV out).
5. **What evidence shows our approach is better?** Measurable compliance across 4 modalities simultaneously (Auditory pitch/pan + Tactile/Pattern SVG + CVD ΔE safety + Screen-reader ARIA roving grid & semantic table), whereas competitors cover only 1 or 2 modalities.
6. **Which key assumption, if false, kills the idea?** If screen-reader users find the keyboard-driven point-by-point sonification and statistical summary harder to navigate than a plain HTML table. (Mitigated by shipping the synchronized semantic HTML table + 1-sentence executive summary right beside the interactive audio chart.)
- **Verdict**: **KEEP (Top Recommendation #1)**

### Critique of Candidate 2: **CaptionCraft SDH** (Deaf/HoH Caption Compliance & Rhythm Studio)
1. **Does this product truly need to exist?** Yes, raw Whisper/YouTube captions violate BBC/Netflix/WCAG reading-speed and phrase-splitting rules.
2. **Why can't existing tools solve it?** Subtitle Edit is Windows-only (#81); cloud tools require uploading heavy private videos and paying monthly subscriptions.
3. **Is there a simpler, cheaper, non-AI solution?** Yes — deterministic grammatical rule-splitting and timing-gap normalization require zero AI.
4. **Will users try it once and abandon it?** Educators and video creators who already caption inside CapCut/Premiere may resist adding an extra SRT export/re-import step unless they specifically need strict SDH compliance.
5. **What evidence shows our approach is better?** Before/after reductions in >20 CPS cues and >42 CPL line violations on real Whisper transcripts.
6. **Which key assumption, if false, kills the idea?** If target users do not know how to export/import `.srt` or `.vtt` files from their video host.
- **Verdict**: **KEEP AS RUNNER-UP (#3)**

### Critique of Candidate 3: **CivicPlain Studio** (Plain-Language Medical/IEP/Civic Remediator)
1. **Does this product truly need to exist?** Public health and civic documents are notoriously written at a 12th–15th grade level.
2. **Why can't existing tools solve it?** Hemingway only highlights sentences without offering CDC/Federal plain-language replacements or accessible handout formatting.
3. **Is there a simpler, cheaper, non-AI solution?** Yes, a deterministic CDC/Federal plain-language dictionary + SMOG calculator. However, a user can also paste non-sensitive public text into a free LLM with a prompt *"Rewrite at a 6th-grade reading level"*.
4. **Will users try it once and abandon it?** Only users bound by strict HIPAA/FERPA offline rules will strongly prefer deterministic dictionary replacement over free LLM rewriting.
5. **What evidence shows our approach is better?** Deterministic SMOG grade-level reduction and zero hallucination risk on medical dosages/contraindications.
6. **Which key assumption, if false, kills the idea?** If word/phrase replacement + clause splitting cannot lower SMOG grade levels enough on complex legal syntax without generative paraphrasing.
- **Verdict**: **KEEP AS VIABLE CANDIDATE (#4)**

### Critique of Candidate 4: **GreenByte Auditor** (Web Carbon & Low-Bandwidth Workbench)
1. **Does this product truly need to exist?** Useful for sustainability reporting, though most performance engineers already use Lighthouse.
2. **Why can't existing tools solve it?** WebsiteCarbon only gives a single URL score; CO2.js is a code library (#138, #295).
3. **Is there a simpler, cheaper, non-AI solution?** Chrome DevTools Network tab + Lighthouse already tells developers which images/scripts are large, even if it doesn't convert bytes into grams of CO2.
4. **Will users try it once and abandon it?** High risk of one-time curiosity use ("let's check our site's carbon score once").
5. **What evidence shows our approach is better?** SWDM v4 segment visibility + regional grid comparison.
6. **Which key assumption, if false, kills the idea?** Because browser CORS prevents fetching arbitrary third-party websites directly from a static frontend, requiring users to export a `.har` file adds significant onboarding friction.
- **Verdict**: **DEPRIORITIZE (Rank #5 — High CORS/onboarding friction and overlaps with Lighthouse)**

### Critique of Candidate 5: **ChromaGuard APCA** (Perceptual Contrast & CVD CSS Remediator)
1. **Does this product truly need to exist?** Helpful for design systems, but the GitHub ecosystem already has dozens of OKLCH/APCA contrast checkers.
2. **Why can't existing tools solve it?** Existing tools mostly check single pairs rather than full CSS files, though several recent tools (`hueristic`, `color-scorer`) are closing that gap.
3. **Is there a simpler, cheaper, non-AI solution?** Yes, OKLCH math is non-AI.
4. **Will users try it once and abandon it?** Yes — once a team fixes their `tokens.css` once, they rarely return for months.
5. **What evidence shows our approach is better?** Minimal ΔE drift in OKLCH space.
6. **Which key assumption, if false, kills the idea?** In a "Code for Change" social-impact hackathon, judges often view a developer CSS palette tool as low-direct-human-impact compared to assistive tools for blind, non-speaking, or Deaf users.
- **Verdict**: **ELIMINATE FROM TOP RECOMMENDATIONS (Rank #6 — Low repeat usage & weak direct social-impact narrative)**

### Critique of Candidate 6: **AAC BoardSmith** (Offline-First Bilingual AAC & Switch-Scanning Studio)
1. **Does this product truly need to exist?** Yes. Non-speaking students, post-stroke/intubated ICU patients, and underfunded special-ed teachers urgently need a zero-login, free tool that creates both interactive switch-scannable TTS boards and laminated bedside/classroom print sheets.
2. **Why can't existing tools solve it?** Boardmaker costs $99–$199/yr; Cboard suffers from login walls, black-screen spinners (#1871), and lacks clinical print-sheet + automatic Fitzgerald Key layout tools.
3. **Is there a simpler, cheaper, non-AI solution?** Yes — deterministic Fitzgerald Key POS color-coding, OpenBoard Format (`.obf`) JSON export, Web Speech TTS, and 1-Switch/2-Switch keyboard scanning require zero AI and work 100% offline.
4. **Will users try it once and abandon it?** No — teachers and SLPs build topic-specific boards every week (e.g., science lab, cafeteria, hospital pain scale, field trip) and use the interactive board daily.
5. **What evidence shows our approach is better?** Validated `.obf` schema interoperability, WCAG AAA target size/contrast compliance, and a 5x reduction in steps compared to formatting Word/Slides tables.
6. **Which key assumption, if false, kills the idea?** If the built-in clinical vocabulary & pictogram set feels too small and custom tile creation takes too many clicks. (Mitigated by shipping 150+ categorized clinical core/hospital/school pictograms + instant custom SVG/emoji/photo tile creator.)
- **Verdict**: **KEEP (Top Recommendation #2)**

---

## 4. Phase 4: Comparison Matrix, Recommendations & Risks

### 4.1 Candidate Comparison Table

| # | Candidate Name | Social Good Domain | Target User | Practical Value | Innovation | Comp. Advantage | UX | Feasibility | **Total (/50)** | Critique Status |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|
| **1** | **SonoChart Studio** | Accessibility & STEM / Civic Data | Educators, Civic Analysts, Blind/Low-Vision Readers | 9.0 | 9.0 | 8.5 | 9.0 | 9.5 | **45.0** | **Recommended #1** |
| **6** | **AAC BoardSmith** | Assistive Tech, Special Ed & Healthcare | SLPs, Special-Ed Teachers, ICU Nurses, Non-Speaking Users | 9.0 | 8.0 | 8.5 | 9.0 | 9.0 | **43.5** | **Recommended #2** |
| **2** | **CaptionCraft SDH** | Deaf/HoH Media & Education Accessibility | Educators, Nonprofit Video Creators | 8.5 | 7.5 | 8.0 | 8.5 | 9.0 | **41.5** | **Runner-Up #3** |
| **3** | **CivicPlain Studio** | Health Literacy & Civic Equity | Community Clinics, IEP Teachers, Legal Aid | 8.5 | 7.0 | 7.5 | 8.5 | 9.5 | **41.0** | **Viable #4** |
| **4** | **GreenByte Auditor** | Climate & Low-Bandwidth Inclusion | Civic Web Developers, NGOs | 7.5 | 7.5 | 7.5 | 8.0 | 9.0 | **39.5** | Deprioritized (CORS/Lighthouse overlap) |
| **5** | **ChromaGuard APCA** | Web Design Accessibility | Frontend Developers, UI Designers | 8.0 | 6.5 | 7.0 | 8.5 | 9.5 | **39.5** | Eliminated (Low repeat use & crowded niche) |

### 4.2 Top Recommendation & Risk Summary

1. **Top Recommendation — Candidate 1: `SonoChart Studio` (Multi-Modal Accessible Data Visualization & Sonification Authoring Studio)**
   - **Why it wins on all 4 Code for Change judging criteria**:
     - *Impact*: Turns silent, color-dependent STEM and civic charts into multisensory accessible artifacts (Web Audio pitch/pan sonification + tactile geometric SVG pattern fills + color-blind safe OKLCH palettes + ARIA roving-tabindex keyboard grid + W3C statistical summary).
     - *Originality & UX*: Judges and users can immediately **hear** climate, health, or education data played as stereo spatial audio, scrub point-by-point with the keyboard, toggle color-blindness & screen-reader simulation modes, and export a self-contained HTML widget + WAV audio file.
     - *Technical Execution*: 100% real client-side math and Web Audio DSP (`AudioContext` + `OfflineAudioContext` WAV encoder, SVG pattern geometry, Machado 2009 CVD matrices, APCA contrast solver) with zero external API keys or brittle backends.
   - **Key Risks & Mitigations**:
     - *Risk*: Raw sine waves sound unpleasant. *Mitigation*: Quantize pitches to harmonic pentatonic/major scales with warm ADSR envelopes, stereo panning, and distinct instrument timbres per series.
     - *Risk*: Overcrowded UI. *Mitigation*: Enforce strict 1-primary-action-per-view UX contract (Studio Canvas + Multisensory Inspector + Export Drawer).

2. **Strong Alternative — Candidate 6: `AAC BoardSmith` (Offline-First Bilingual AAC & Switch-Scanning Communication Studio)**
   - **Why it stands out**: Deeply human healthcare/special-ed impact, distinctive clinical Fitzgerald Key visual identity, interactive 1-Switch/2-Switch keyboard scanning + Web Speech TTS, and dual export to OpenBoard Format (`.obf`) and printable laminated bedside/classroom sheets.
   - **Key Risk**: Browser TTS voice quality varies across operating systems.

3. **Third Option — Candidate 2: `CaptionCraft SDH` (Deaf/HoH Caption Compliance & Rhythm Studio)**
   - **Why it stands out**: Solves a concrete, measurable gap in Whisper/YouTube caption workflows (CPS reading speed, linguistic line splitting, and SDH non-speech tags) right in the browser.
   - **Key Risk**: Less visually distinctive at first glance than SonoChart Studio or AAC BoardSmith.
