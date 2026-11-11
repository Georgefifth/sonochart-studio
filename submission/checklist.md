# Human Submission Checklist — SonoChart Studio (Code for Change)

> Per `AGENTS.md`, the AI agent never logs into Devpost, fills online forms, or clicks Submit. Follow the steps below to complete the submission in ~3 minutes.

---

## Step-by-Step Submission Procedure

1. **Upload the Demo Video (`submission/assets/demo.mp4`)**:
   - Upload `/home/yap/Hack/code-for-change/submission/assets/demo.mp4` (`1080p30`, `83.2s`, `11 MB`) to YouTube (Public or Unlisted) or Vimeo.
   - Copy the resulting video URL.
2. **Open the Hackathon on Devpost**:
   - Go to [https://code-for-change-global.devpost.com/](https://code-for-change-global.devpost.com/) and open your project submission form.
3. **Copy & Paste Text Fields from `submission/fields.md`**:
   - **Project name**: Copy from Section 1 (`SonoChart Studio`).
   - **Elevator pitch**: Copy from Section 2 (`182 characters`, within the 200-character limit).
   - **About the project**: Copy the entire Markdown block from Section 4.
   - **Built with**: Paste the tags from Section 5 (`typescript`, `react`, `vite`, `web-audio-api`, `svg`, `accessibility`, `wcag`, `html5`, `css3`, `playwright`, `vitest`, `github-pages`).
   - **"Try it out" links**:
     - `https://georgefifth.github.io/sonochart-studio/`
     - `https://github.com/Georgefifth/sonochart-studio`
   - **Video link**: Paste your YouTube / Vimeo URL from Step 1.
4. **Upload Visual Assets from `submission/assets/`**:
   - **Thumbnail**: Upload `submission/assets/00-thumbnail.png` (`1200×800`, 3:2 ratio, `114.5 KB`).
   - **Image Gallery**: Upload `01-gallery-studio-default.png` through `06-gallery-benchmark-validation.png` and paste the matching 1-line English caption (`<= 150` chars) for each image from Section 7 of `submission/fields.md`.
5. **Final Preview & Submit**:
   - Preview the Devpost project page to verify Markdown headings, code spans, gallery captions, video embed, and links, then click **Submit Project**.

---

## Pre-Submission Verification Checklist

- [x] **Project Name**: `SonoChart Studio` (concise, matches UI and repo).
- [x] **Elevator Pitch**: `182 / 200` characters verified.
- [x] **Thumbnail (`00-thumbnail.png`)**: Custom-generated `1200×800` (3:2) PNG (`114.5 KB < 5 MB`), not cropped from a screenshot.
- [x] **About the Project Markdown**: All 7 required sections (`## Inspiration`, `## What it does`, `## How we built it`, `## Challenges we ran into`, `## Accomplishments that we're proud of`, `## What we learned`, `## What's next for SonoChart Studio`) present; formulas and HTML/XML tags wrapped in backticks; all quantitative claims backed by Stage 3 & Stage 3.5 evidence.
- [x] **Built With Tags**: 12 accurate technical tags (`<= 25` limit).
- [x] **Live Links Verified**:
  - Live App (`https://georgefifth.github.io/sonochart-studio/`) returns HTTP `200`.
  - GitHub Repo (`https://github.com/Georgefifth/sonochart-studio`) returns HTTP `200` and contains zero secrets/tokens.
- [x] **Image Gallery (`01`–`06`)**: 6 PNG images, all exact `3:2` aspect ratio (`1200×800`), `177 KB – 391 KB` (`< 5 MB`), each with a caption `<= 150` characters (`110–117` chars).
- [x] **Demo Video (`submission/assets/demo.mp4`)**: Rendered `1920×1080` @ `30 FPS`, `83.21s`, `11 MB`, frame-checked with zero visual overlap or unverified claims.
- [ ] **Human Action Pending**: Upload `demo.mp4` to YouTube/Vimeo, paste fields & assets into Devpost, and click Submit.
