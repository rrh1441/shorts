# AGENTS.md

## Shorts — Component‑Driven Video Automation

A Remotion-powered system where agents orchestrate prebuilt UI components by generating JSON props (validated with Zod) instead of writing animation code. This makes renders reliable, legible, and deterministic while keeping the AI’s job simple.

---

## How Agents Operate

1. Extract insights → Build a single source of truth (UniversalInsights).
2. Draft narrative → 5–7 scenes, each 6–15s with a clear purpose.
3. Plan a scene → Pick a visual strategy (statistic, text, callout).
4. Select component → From the curated library (StatBlock, AnimatedText, CalloutBox to start).
5. Generate props → Return JSON matching each component’s Zod schema.
6. Validate + fallback → Schemas enforce correctness; invalid props merge with defaults.
7. Emit TSX per scene → The orchestrator builds a thin wrapper using the chosen component.
8. TTS + render → Generate per‑scene audio and MP4s; stitch externally as needed.

---

## Agent Rules (Do / Don’t)

- Do: return JSON props, not TSX/JSX code.
- Do: respect the video format (vertical/square/horizontal) and readability constraints.
- Do: keep durations realistic (6–15s), avoid tiny text, ensure clear hierarchy.
- Don’t: invent component names. Use the registry provided by this repo.
- Don’t: set absolute widths/heights unless asked; prefer semantic sizes where available.
- Don’t: add randomness (determinism matters for repeatability).

---

## Scripts

- preview: Launch Remotion Studio with a minimal demo composition.
  - `npm run preview`
- generate: Transform UniversalInsights JSON into segmented components + TTS scripts.
  - `npm run generate <universal-insights.json> [output-dir] [format]`
  - Formats: `vertical` (default), `square`, `horizontal`
- render: Render a single segment TSX to MP4.
  - `npm run render <SegmentXComponent.tsx> <output.mp4>`
- render:with-audio: Render and mux an external audio file via ffmpeg.
  - `npm run render:with-audio <SegmentXComponent.tsx> <output.mp4> <audio.mp3>`
- plan: Lint a spec or the generated segments and write a basic report.
  - `npm run plan [path/to/spec.json]`

---

## Pipeline Output

Output directory (example):

```
output/
  animated-video/
    Segment1Component.tsx
    segment-1-script.txt
    segment-1-audio.mp3
    segment-1.mp4 (after render)
    video-segments.json
    RENDERING-INSTRUCTIONS.md
  lint-report.json (from plan)
  segment-metadata.json
```

---

## Component Library Contract

- Location: `remotion/ui-components`
- Components export both the implementation and a Zod schema + defaults. Example:
  - `AnimatedText.tsx` → `AnimatedText`
  - `AnimatedText.schema.ts` → `AnimatedTextPropsSchema`, `getAnimatedTextDefaults()`
- Agents must select from known components only and return props conforming to the schema. The orchestrator validates and merges invalid props with defaults.

Current registry (curated for reliability):
- `StatBlock`: Metrics/KPIs with animated counters and layout options.
- `AnimatedText`: Headlines/titles with typewriter/fade/slide/scale/reveal.
- `CalloutBox`: Highlighted content with variants, icons, and animations.

---

## Determinism & Readability Guardrails

- FPS: 30; even dimensions for encoder compatibility.
- Dwell time: ensure text is readable (≈0.18s/word minimum).
- Safe margins: ≥3% gutter for mobile; avoid edge-clipping.
- No runtime randomness; animations should be consistent.

---

## Recommended Flow (Works Today)

1. Prepare UniversalInsights JSON (or use `shared/insights.ts` to extract it).
2. `npm run generate insights.json ./output vertical`
3. Inspect `output/animated-video` for generated TSX + TTS.
4. Render each segment:
   - `npm run render ./output/animated-video/Segment1Component.tsx ./output/animated-video/segment-1.mp4`
   - `npm run render:with-audio ./output/animated-video/Segment1Component.tsx ./output/animated-video/segment-1-final.mp4 ./output/animated-video/segment-1-audio.mp3`
5. Optionally run a quick lint:
   - `npm run plan ./output/animated-video/video-segments.json`

---

## Notes on @contentfork/remotion-ui

- The npm package is a CLI for scaffolding components into your repo; it is not a runtime component library.
- This project already includes a local `remotion/ui-components` directory with components and schemas. Agents should use the local registry.

---

## Roadmap (Non‑blocking)

- Format‑aware presets (portrait/square/landscape) to replace raw width/height choices.
- Storybook dictionary for AI selection and prop exploration.
- Timeline helpers (Sequences + speech-mark alignment).
- Batch rendering and asset caching for scale.

---

Updated 2025‑08‑31

